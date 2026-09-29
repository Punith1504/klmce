import hmac
import hashlib
import json
import uuid
import requests
import time

# ==========================================
# Configuration Variables
# ==========================================
BASE_URL = "http://localhost:8000/api/v1"  # Replace with actual FastAPI dev server URL
WEBHOOK_SECRET = b"test_webhook_secret_key_12345"  # Must match the env var running the FastAPI app
ENDPOINT = f"{BASE_URL}/payments/webhook"

def generate_webhook_payload() -> dict:
    """Generates a mock webhook payload mimicking a successful payment event."""
    return {
        "event": "payment.succeeded",
        "data": {
            "payment_intent_id": f"pi_test_{uuid.uuid4().hex}",
            "amount": 1500.00,
            "currency": "USD",
            "student_id": str(uuid.uuid4()),
            "tenant_id": str(uuid.uuid4())
        },
        "created": int(time.time())
    }

def compute_signature(secret: bytes, payload_bytes: bytes) -> str:
    """Computes the HMAC-SHA256 signature for the given payload using the secret."""
    return hmac.new(key=secret, msg=payload_bytes, digestmod=hashlib.sha256).hexdigest()

def test_successful_webhook_ingestion():
    """
    Tests that a correctly signed webhook is accepted (200 OK) and 
    processed as a unique transaction, bypassing idempotency locks.
    """
    print(">>> Starting Webhook Integration Test...")
    
    # 1. Prepare Payload
    payload = generate_webhook_payload()
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    
    # 2. Compute Signature
    signature = compute_signature(WEBHOOK_SECRET, payload_bytes)
    print(f"[INFO] Generated Signature: {signature}")
    
    # 3. Setup Headers
    headers = {
        "Content-Type": "application/json",
        "X-Payment-Signature": signature
    }
    
    # 4. Dispatch First Request (Initial Processing)
    print(f"[INFO] Dispatching POST to {ENDPOINT}")
    try:
        response = requests.post(ENDPOINT, data=payload_bytes, headers=headers, timeout=5)
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection refused. Is the FastAPI server running on localhost:8000?")
        return

    print(f"[RESPONSE 1] Status: {response.status_code}, Body: {response.text}")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    # Wait, assuming the endpoint returns something indicating success, not idempotent_bypass
    assert "idempotent_bypass" not in response.text, "First request should NOT be bypassed as idempotent"
    
    # 5. Dispatch Second Request (Idempotency Check)
    print("\n[INFO] Dispatching duplicate POST to test idempotency lock...")
    response_dup = requests.post(ENDPOINT, data=payload_bytes, headers=headers, timeout=5)
    
    print(f"[RESPONSE 2] Status: {response_dup.status_code}, Body: {response_dup.text}")
    assert response_dup.status_code == 200, f"Expected 200 OK for duplicate webhook, got {response_dup.status_code}"
    assert "idempotent_bypass" in response_dup.text, "Duplicate request MUST trigger idempotency bypass"
    
    print("\n>>> SUCCESS: Webhook signature verified and idempotency mechanics function correctly.")

if __name__ == "__main__":
    # Note: To run this test, ensure the FastAPI server is running with the matching WEBHOOK_SECRET.
    # e.g., export WEBHOOK_SECRET="test_webhook_secret_key_12345" && uvicorn main:app
    test_successful_webhook_ingestion()
