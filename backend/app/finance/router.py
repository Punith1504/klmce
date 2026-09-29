import json
import uuid
import asyncio
from fastapi import APIRouter, Request, Depends, Header, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as redis

from .models import FeeLedgerEntry, EntryType
from .webhook_utils import verify_webhook_signature
from ..core.security import RFC7807Exception

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

async def get_db_session() -> AsyncSession:
    raise NotImplementedError("Session dependency not injected")

async def get_redis_client() -> redis.Redis:
    raise NotImplementedError("Redis dependency not injected")

async def generate_verifiable_receipt(ledger_id: uuid.UUID):
    """
    Asynchronous background task to produce a cryptographically verifiable PDF receipt.
    """
    await asyncio.sleep(1) # Mock PDF generation pipeline
    
    # Logic Map:
    # 1. Query the immutable ledger row using ledger_id
    # 2. Render highly stylized PDF using Jinja2/WeasyPrint
    # 3. Attach standard X.509 cryptographic signature to the PDF document
    # 4. Push to secure S3 bucket and enqueue email notification
    print(f"[{ledger_id}] Verifiable Receipt generated and signed securely.")

@router.post("/webhook")
async def payment_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_signature: str = Header(None, alias="X-Payment-Signature"),
    db: AsyncSession = Depends(get_db_session),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    Ingests payment provider webhooks securely.
    Features: Raw byte extraction, HMAC verification, Redis idempotency, and Append-Only immutable writes.
    """
    # 1. Stream raw bytes BEFORE any parsing logic to preserve precise signature integrity
    raw_body = await request.body()
    
    # 2. Cryptographic signature check
    verify_webhook_signature(raw_body, x_signature)
    
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")
        
    event_type = payload.get("event")
    data = payload.get("data", {})
    payment_intent_id = data.get("payment_intent_id")
    
    if not payment_intent_id:
        return {"status": "ignored", "reason": "Payload missing payment_intent_id attribute."}
        
    # 3. Redis Idempotency Check to deflect retry duplicates
    idempotency_key = f"webhook_processed:{payment_intent_id}"
    
    # setnx ensures atomicity: returns true if key was absent and is now set
    is_processed = await redis_client.setnx(idempotency_key, "PROCESSING")
    if not is_processed:
        return {"status": "idempotent_bypass", "reason": "Webhook successfully intercepted as a duplicate retry."}
        
    await redis_client.expire(idempotency_key, 86400 * 7) # Protect idempotency state for 7 days
    
    try:
        if event_type == "payment.succeeded":
            tenant_id = uuid.UUID(data.get("tenant_id"))
            student_id = uuid.UUID(data.get("student_id"))
            amount_paid = float(data.get("amount", 0.0))
            currency = data.get("currency", "USD")
            
            # Fetch balance with FOR UPDATE lock inside PostgreSQL transaction in real impl.
            previous_balance = 1000.00 # Simulated query
            new_balance = previous_balance - amount_paid
            
            # 4. Immutable Append-Only Commitment
            ledger_entry = FeeLedgerEntry(
                tenant_id=tenant_id,
                student_id=student_id,
                amount=amount_paid,
                currency=currency,
                entry_type=EntryType.CREDIT,
                balance_after=new_balance,
                reference_id=payment_intent_id
            )
            db.add(ledger_entry)
            await db.commit()
            await db.refresh(ledger_entry)
            
            # 5. Offload Receipt PDF generation
            background_tasks.add_task(generate_verifiable_receipt, ledger_entry.id)
            
            return {"status": "success", "ledger_id": str(ledger_entry.id)}
            
        else:
            return {"status": "ignored", "reason": f"Unhandled event type: {event_type}"}
            
    except Exception as e:
        # Upon critical database failure, drop the Redis lock so webhook engine can cleanly retry
        await redis_client.delete(idempotency_key)
        raise RFC7807Exception(status_code=500, type="about:blank", title="Processing Error", detail=str(e))
