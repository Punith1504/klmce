import time
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
import redis.asyncio as redis
import jwt

# Note: In a real architecture, these are loaded from Env variables
stripe.api_key = "sk_test_mock_stripe_key"
REDIS_URL = "redis://localhost:6379"

router = APIRouter(prefix="/v1", tags=["Public API Gateway"])

# Initialize Redis client pool for rate limiting
redis_pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)
redis_client = redis.Redis(connection_pool=redis_pool)

async def verify_external_token(authorization: str = Header(...)):
    """Verifies the scoped JWT issued by our OAuth server."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
    token = authorization.split(" ")[1]
    try:
        # In production, use the centralized SECRET_KEY
        payload = jwt.decode(token, "oauth-secret-key", algorithms=["HS256"])
        if payload.get("type") != "external_api":
            raise ValueError()
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

async def gateway_rate_limiter(request: Request, token_payload: dict = Depends(verify_external_token)):
    """
    High-performance Redis-backed rate limiter with Stripe Metered Billing.
    Allows 1,000 free requests/day. Paid tier triggers a Stripe usage event.
    """
    client_id = token_payload.get("client_id")
    
    # 1. Fetch App Metadata (Mocked - normally fetched from DB/Cache)
    app_tier = "FREE" # or "PAID"
    stripe_customer = "cus_mock123"
    
    current_day = time.strftime("%Y-%m-%d")
    redis_key = f"rate_limit:{client_id}:{current_day}"
    
    # Increment counter atomically
    usage_count = await redis_client.incr(redis_key)
    
    # Set expiration on the key if it's new (24 hours)
    if usage_count == 1:
        await redis_client.expire(redis_key, 86400)
        
    # Apply Tier Restrictions & Monetization
    if app_tier == "FREE":
        if usage_count > 1000:
            raise HTTPException(
                status_code=429, 
                detail="Daily free tier limit (1,000 requests) exceeded. Please upgrade to a PAID tier in the Developer Portal."
            )
    elif app_tier == "PAID":
        # Over the free limit, start charging via Stripe Metered Billing
        if usage_count > 1000:
            try:
                # Dispatch usage event to Stripe for usage-based billing
                stripe.billing.MeterEvent.create(
                    event_name="api_request",
                    payload={
                        "value": "1",
                        "stripe_customer_id": stripe_customer,
                    },
                )
            except Exception as e:
                # Log billing error but optionally allow request to proceed
                print(f"Billing Error: {str(e)}")

    return token_payload

# ==========================================
# Protected Public Endpoints (Proxied to ERP Core)
# ==========================================
@router.get("/attendance")
async def get_attendance(token_payload: dict = Depends(gateway_rate_limiter)):
    """
    Public API: Fetch attendance records.
    Enforces the 'read:attendance' OAuth scope.
    """
    scopes = token_payload.get("scopes", [])
    if "read:attendance" not in scopes:
        raise HTTPException(status_code=403, detail="Missing required scope: read:attendance")
        
    user_id = token_payload.get("sub")
    return {"message": "Attendance data retrieved successfully via API Gateway", "user_id": user_id, "data": []}
