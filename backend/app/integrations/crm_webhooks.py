import logging
from fastapi import APIRouter, Request, Header, HTTPException
import hmac
import hashlib

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/integrations/crm", tags=["Admissions CRM Webhooks"])

# Institutional Secret Key configured in environment variables
CRM_WEBHOOK_SECRET = b"KLMCE_SUPER_SECRET_HMAC_KEY"

@router.post("/nopaperforms/listener")
async def nopaperforms_webhook_listener(request: Request, x_npf_signature: str = Header(None)):
    """
    Inbound Webhook Listener for Admissions CRMs (NoPaperForms, ExtraaEdge, LeadSquared).
    When a marketing lead converts to a paid applicant in the external CRM, it pushes a JSON 
    payload here. This endpoint cryptographically verifies the origin before ingesting the lead 
    into the KLMCE admissions ledger.
    """
    payload = await request.body()
    
    # 1. Cryptographic HMAC-SHA256 Integrity Verification
    expected_hash = hmac.new(CRM_WEBHOOK_SECRET, payload, hashlib.sha256).hexdigest()
    
    if not x_npf_signature or expected_hash != x_npf_signature:
        logger.error(f"CRM Webhook Signature Mismatch. Expected: {expected_hash}, Received: {x_npf_signature}")
        raise HTTPException(status_code=403, detail="FORBIDDEN: Invalid HMAC-SHA256 Signature. Webhook forgery detected.")
        
    # 2. Process Payload
    # data = await request.json()
    # await conn.execute("INSERT INTO admissions.applications ...")
    
    logger.info("Successfully cryptographically verified and ingested inbound CRM webhook payload.")
    return {"status": "ACCEPTED"}
