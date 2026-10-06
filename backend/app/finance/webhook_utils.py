import os
import hmac
import hashlib
from fastapi import HTTPException
from app.core.security import validate_secret

def verify_webhook_signature(payload_body,signature_header):
    if not signature_header: raise HTTPException(400,'Signature required')
    secret=os.getenv('PAYMENT_WEBHOOK_SECRET','')
    try: validate_secret(secret,'PAYMENT_WEBHOOK_SECRET')
    except RuntimeError: raise HTTPException(503,'Payment verification is not configured') from None
    expected=hmac.new(secret.encode(),payload_body,hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,signature_header): raise HTTPException(400,'Invalid signature')
    return True
