import hmac
import hashlib
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Response
from app.messaging.tasks import process_inbound_whatsapp_message

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/integrations/whatsapp", tags=["WhatsApp Business API"])

# In production, these are loaded securely from environment variables / AWS Secrets Manager
META_APP_SECRET = "klmce_meta_app_secret_placeholder"
VERIFY_TOKEN = "klmce_erp_secure_verify_token_2026"

@router.get("/webhook")
async def verify_meta_webhook_challenge(request: Request):
    """
    Step 1: Meta Cloud API Handshake
    When registering the webhook on the Facebook Developer Portal, Meta sends a GET request
    with a hub.challenge that we must reflect back to prove endpoint ownership.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == VERIFY_TOKEN:
        logger.info("Successfully verified Meta WhatsApp Webhook.")
        return Response(content=challenge, media_type="text/plain")
        
    raise HTTPException(status_code=403, detail="Invalid verification token")

@router.post("/webhook")
async def ingest_whatsapp_events(request: Request):
    """
    Step 2: Webhook Ingestion & Cryptographic Verification
    Receives live WhatsApp messages, delivery receipts, and button clicks from parents/students.
    """
    # 1. Enforce HMAC-SHA256 Cryptographic Signature to ensure payload is genuinely from Meta
    signature = request.headers.get("X-Hub-Signature-256", "")
    if not signature.startswith("sha256="):
        raise HTTPException(status_code=403, detail="Missing X-Hub-Signature-256 header")
        
    payload_body = await request.body()
    
    expected_hash = hmac.new(
        META_APP_SECRET.encode('utf-8'),
        msg=payload_body,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature[7:], expected_hash):
        logger.error("Cryptographic signature mismatch! Potential spoofed payload dropped.")
        raise HTTPException(status_code=403, detail="Cryptographic signature mismatch")
        
    # 2. Parse the verified payload
    payload = json.loads(payload_body)
    
    try:
        # Check if the payload contains actual inbound messages from users
        changes = payload.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {})
        if "messages" in changes:
            # 3. Dispatch to Celery Background Worker!
            # Meta requires a strict 200 OK within 3 seconds, so we CANNOT perform DB lookups here.
            process_inbound_whatsapp_message.delay(payload)
            
    except Exception as e:
        logger.error(f"Error parsing WhatsApp payload: {e}")
        
    # Must immediately return 200 to Meta to prevent retry loops
    return {"status": "accepted"}
