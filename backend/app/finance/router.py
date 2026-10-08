import os
import json
import hmac
import hashlib
from decimal import Decimal, InvalidOperation
from fastapi import APIRouter, Request, Header, HTTPException
from app.core.security import validate_secret

router=APIRouter()
WEBHOOK_SECRET=os.getenv('WEBHOOK_SECRET','').encode()

@router.post('/webhook')
async def process_payment_webhook(request:Request,x_payment_signature:str=Header(None,alias='X-Payment-Signature')):
    if not x_payment_signature: raise HTTPException(400,'Signature required')
    try: validate_secret(WEBHOOK_SECRET.decode(),'WEBHOOK_SECRET')
    except RuntimeError: raise HTTPException(503,'Payment verification is not configured') from None
    body=await request.body()
    if len(body)>65536: raise HTTPException(413,'Payload too large')
    expected=hmac.new(WEBHOOK_SECRET,body,hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,x_payment_signature): raise HTTPException(401,'Invalid signature')
    try:
        payload=json.loads(body)
        amount=Decimal(str(payload['amount']))
        if not amount.is_finite() or amount<=0: raise ValueError()
    except (ValueError,KeyError,TypeError,InvalidOperation): raise HTTPException(422,'Invalid payment amount') from None
    # Do not acknowledge an event that cannot be durably posted to a validated
    # provider/invoice model. Provider retries are preferable to lost payments.
    raise HTTPException(503,'Payment posting is disabled pending provider reconciliation setup')
