import os
import json
import hmac
import hashlib
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# In production, these should be loaded from secure secrets management (e.g. AWS Secrets Manager, HashiCorp Vault)
AES_KEY = os.environ.get("ATTENDANCE_AES_KEY", os.urandom(32))  # 32 bytes for AES-256-GCM
HMAC_KEY = os.environ.get("ATTENDANCE_HMAC_KEY", os.urandom(32)).encode('utf-8')

def generate_qr_payload(tenant_id: str, slot_id: str, nonce: str) -> str:
    """
    Constructs a rolling QR payload: AES_GCM_ENCRYPT(tenant, slot, ts, nonce) + HMAC-SHA256 signature.
    """
    timestamp = int(time.time())
    payload_dict = {
        "tenant_id": tenant_id,
        "slot_id": slot_id,
        "ts": timestamp,
        "nonce": nonce
    }
    payload_bytes = json.dumps(payload_dict).encode('utf-8')
    
    # AES-GCM Encryption
    aesgcm = AESGCM(AES_KEY)
    iv = os.urandom(12)
    ciphertext = aesgcm.encrypt(iv, payload_bytes, None)
    
    encrypted_blob = iv + ciphertext
    b64_encrypted = urlsafe_b64encode(encrypted_blob).decode('utf-8')
    
    # HMAC-SHA256 Signature to prevent tampering
    signature = hmac.new(HMAC_KEY, b64_encrypted.encode('utf-8'), hashlib.sha256).hexdigest()
    
    return f"{b64_encrypted}.{signature}"

def verify_and_decrypt_qr_payload(token: str) -> dict:
    """
    Verifies the HMAC signature and decrypts the AES-GCM payload.
    """
    parts = token.split('.')
    if len(parts) != 2:
        raise ValueError("Malformed cryptographic token")
        
    b64_encrypted, signature = parts
    
    # Verify HMAC
    expected_signature = hmac.new(HMAC_KEY, b64_encrypted.encode('utf-8'), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_signature, signature):
        raise ValueError("Cryptographic signature mismatch. Payload was tampered with.")
        
    # Decrypt
    encrypted_blob = urlsafe_b64decode(b64_encrypted)
    if len(encrypted_blob) <= 12:
        raise ValueError("Invalid encrypted block size.")
        
    iv = encrypted_blob[:12]
    ciphertext = encrypted_blob[12:]
    
    aesgcm = AESGCM(AES_KEY)
    try:
        decrypted_bytes = aesgcm.decrypt(iv, ciphertext, None)
    except Exception:
        raise ValueError("Decryption failed. Potential tampering or incorrect AES key.")
        
    return json.loads(decrypted_bytes.decode('utf-8'))
