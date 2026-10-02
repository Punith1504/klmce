from fastapi import APIRouter, Depends, Request, Header, HTTPException
import hmac
import hashlib
import os
import json
import asyncpg
import redis.asyncio as aioredis
from app.core.database import get_db_connection
from app.core.redis import get_redis_client

router = APIRouter()

# Securely load the webhook signing secret from environment variables
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "default_insecure_secret_replace_in_prod").encode('utf-8')

@router.post("/webhook")
async def process_payment_webhook(
    request: Request,
    x_payment_signature: str = Header(None, alias="X-Payment-Signature"),
    conn: asyncpg.Connection = Depends(get_db_connection),
    redis_client: aioredis.Redis = Depends(get_redis_client)
):
    """
    Secure server-to-server webhook ingestion endpoint.
    Strictly authenticates payloads utilizing HMAC-SHA256 mathematical proofs and enforces
    idempotency via Redis to prevent duplicate ledger transactions from automated network retries.
    """
    if not x_payment_signature:
        raise HTTPException(status_code=400, detail="Missing X-Payment-Signature header")

    # 1. CRITICAL SECURITY: Extract raw byte stream
    # Must pull the exact raw bytes over the wire BEFORE FastAPI/Starlette applies any JSON parsing.
    # Any invisible whitespace format-shifting by the parser will corrupt the cryptographic signature.
    raw_body = await request.body()

    # 2. Mathematical Cryptographic Verification
    expected_mac = hmac.new(WEBHOOK_SECRET, raw_body, hashlib.sha256).hexdigest()
    
    # Utilize compare_digest to mitigate physical timing attacks
    if not hmac.compare_digest(expected_mac, x_payment_signature):
        raise HTTPException(status_code=401, detail="Cryptographic verification failed. Payload tampered.")

    # Parse JSON only AFTER mathematical verification proves the payload is authentic
    try:
        payload = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")

    # Extract required webhook metadata
    payment_intent_id = payload.get("id")
    metadata = payload.get("metadata", {})
    student_id = metadata.get("student_id")
    amount = payload.get("amount")
    
    if not payment_intent_id or not student_id or amount is None:
        raise HTTPException(status_code=400, detail="Missing required payment/student metadata")

    # 3. Distributed Idempotency Lock (Redis)
    # Stripe frequently retries webhooks on network blips. We must guarantee the ledger is append-only.
    lock_key = f"webhook:lock:{payment_intent_id}"
    
    # SETNX: Set only if Not eXists. This operation is strictly atomic.
    lock_acquired = await redis_client.setnx(lock_key, "LOCKED")
    
    if not lock_acquired:
        # A previous webhook already initiated this transaction.
        # Silently return 200 OK so Stripe stops firing automated retries.
        return {"status": "idempotency_halt", "message": "Transaction already recorded"}

    # Enforce a 7-day TTL on the lock to prevent infinite memory bloat in Redis
    await redis_client.expire(lock_key, 7 * 24 * 60 * 60)

    # 4. Atomic Ledger Insertion
    # Because this is a server-to-server call (no logged-in user), we inject standard SQL.
    # The immutable database triggers (init_ledger_triggers.sql) will physically block any attempts 
    # to UPDATE or DELETE this row in the future.
    try:
        query = """
            INSERT INTO fee_transactions (student_id, amount, status, metadata)
            VALUES ($1, $2, 'COMPLETED', $3::jsonb)
            RETURNING transaction_id::text
        """
        
        row = await conn.fetchrow(
            query, 
            student_id, 
            amount, 
            json.dumps({"payment_intent": payment_intent_id})
        )
        
        return {"status": "success", "transaction_id": row["transaction_id"]}
        
    except Exception as e:
        # ⚡ Rollback the Redis lock if the database transaction fatally crashes,
        # otherwise future Stripe retries will be falsely ignored.
        await redis_client.delete(lock_key)
        raise HTTPException(status_code=500, detail="Ledger insertion failed")
