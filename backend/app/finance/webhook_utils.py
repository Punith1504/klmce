import hmac
import hashlib
import os
from fastapi import HTTPException

# In production, this must be loaded securely from vault/env
WEBHOOK_SECRET = os.environ.get("PAYMENT_WEBHOOK_SECRET", "whsec_test_secret").encode('utf-8')

def verify_webhook_signature(payload_body: bytes, signature_header: str) -> bool:
    """
    Verifies the cryptographic signature of the incoming webhook payload.
    Constant-time comparison neutralizes timing attacks.
    """
    if not signature_header:
        raise HTTPException(status_code=400, detail="Missing signature header.")
        
    # Generate the expected HMAC-SHA256 signature
    expected_signature = hmac.new(
        key=WEBHOOK_SECRET,
        msg=payload_body,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    # Constant-time comparison ensures high security
    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(status_code=400, detail="Invalid cryptographic webhook signature.")
        
    return True
