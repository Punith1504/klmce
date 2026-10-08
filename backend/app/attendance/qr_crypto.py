import os
import json
import hmac
import hashlib
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def key_bytes(name):
    value=os.getenv(name, "")
    try: key=bytes.fromhex(value)
    except ValueError: key=b""
    # Accept a 32-byte literal for backwards compatibility; recommend 64 hex chars.
    if len(key)!=32: key=value.encode()
    if len(key)!=32: raise RuntimeError(f"{name} must encode exactly 32 bytes")
    return key

# No random per-worker keys. Secrets are validated at startup and on use.
AES_KEY = None
HMAC_KEY = None

def generate_qr_payload(tenant_id,slot_id,nonce):
    payload=json.dumps({"tenant_id":tenant_id,"slot_id":slot_id,"nonce":nonce,"ts":int(time.time())}).encode()
    iv=os.urandom(12)
    blob=urlsafe_b64encode(iv+AESGCM(AES_KEY or key_bytes("ATTENDANCE_AES_KEY")).encrypt(iv,payload,None)).decode()
    mac=hmac.new(HMAC_KEY or key_bytes("ATTENDANCE_HMAC_KEY"),blob.encode(),hashlib.sha256).hexdigest()
    return blob+"."+mac

def verify_and_decrypt_qr_payload(token):
    try:
        if len(token)>4096: raise ValueError()
        blob,signature=token.split('.')
        mac=hmac.new(HMAC_KEY or key_bytes("ATTENDANCE_HMAC_KEY"),blob.encode(),hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature,mac): raise ValueError()
        data=urlsafe_b64decode(blob)
        payload=json.loads(AESGCM(AES_KEY or key_bytes("ATTENDANCE_AES_KEY")).decrypt(data[:12],data[12:],None))
        if not isinstance(payload,dict) or not isinstance(payload.get('ts'),int): raise ValueError()
        for name in ('tenant_id','slot_id','nonce'):
            if not isinstance(payload.get(name),str): raise ValueError()
        return payload
    except Exception as exc:
        raise ValueError("Invalid QR payload") from exc
