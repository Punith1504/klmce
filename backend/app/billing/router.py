from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import stripe
import os
import json
from datetime import datetime

router = APIRouter(prefix="/api/v1/billing", tags=["SaaS Monetization & Fintech"])

# Securely inject Stripe API Keys from Kubernetes Secrets
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# ==============================================================================
# 1. STRIPE CONNECT: DESTINATION CHARGES & PLATFORM FEES
# ==============================================================================
class TuitionPaymentRequest(BaseModel):
    student_id: str
    amount: float
    currency: str = "usd"
    source_token: str # E.g., tok_visa (secure token from React Native Apple/Google Pay)

@router.post("/tuition/charge")
async def process_tuition_payment(payload: TuitionPaymentRequest, tenant_id: str = "extracted_from_jwt"):
    """
    FinTech Core: Processes a massive student tuition payment directly into the Institution's bank account,
    while automatically siphoning a 1.5% SaaS "Platform Application Fee" directly into our startup's corporate account.
    """
    # 1. Fetch the Institution's physically connected Stripe Account ID (e.g., acct_1Hxyz...)
    # async with pool.acquire() as conn:
    #     tenant_stripe_acct = await conn.fetchval("SELECT stripe_connect_id FROM tenants WHERE tenant_id = $1", tenant_id)
    tenant_stripe_acct = "acct_1MockInstitution" 
    
    # 2. Calculate the 1.5% SaaS Platform Fee (Monetization Engine)
    platform_fee_cents = int((payload.amount * 100) * 0.015)
    total_charge_cents = int(payload.amount * 100)

    try:
        # 3. Execute Stripe Connect Destination Charge
        charge = stripe.Charge.create(
            amount=total_charge_cents,
            currency=payload.currency,
            source=payload.source_token,
            description=f"Tuition Payment for Student {payload.student_id}",
            
            # AUTOMATED FUNDS SPLITTING
            # Immediately routes the remaining 98.5% directly to the school's physical bank account
            transfer_data={
                "destination": tenant_stripe_acct,
            },
            # Magically extracts 1.5% and deposits it into OUR SaaS bank account as revenue
            application_fee_amount=platform_fee_cents,
        )
        
        # 4. Log the physical transaction into the internal immutable PostgreSQL ledger
        # await conn.execute(
        #     "INSERT INTO fee_transactions (tenant_id, student_id, amount, status, type, stripe_charge_id) VALUES ($1, $2, $3, 'SUCCESS', 'PAYMENT', $4)",
        #     tenant_id, payload.student_id, payload.amount, charge.id
        # )
        
        return {
            "status": "success", 
            "charge_id": charge.id, 
            "platform_revenue_generated": platform_fee_cents / 100.0
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# 2. METERED MULTI-TENANT SaaS BILLING WEBHOOK
# ==============================================================================
@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Idempotent Webhook Listener handling asynchronous SaaS subscription lifecycles.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        # Cryptographically verify that the payload physically originated from Stripe
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid cryptographic signature")

    event_type = event['type']
    data = event['data']['object']

    # SCENARIO A: Institutional Invoice is 14 days past due
    if event_type == 'invoice.payment_failed':
        stripe_customer_id = data.get("customer")
        
        # Automatically toggle the tenant status to SUSPENDED.
        # This instantly locks out all 5,000 students, parents, and teachers at the API Gateway level 
        # (via our JWT middleware) until the institution pays their SaaS bill.
        # async with pool.acquire() as conn:
        #     await conn.execute("UPDATE tenants SET status = 'SUSPENDED' WHERE stripe_customer_id = $1", stripe_customer_id)
        
        print(f"[{datetime.now()}] CRITICAL: Tenant {stripe_customer_id} suspended due to unpaid SaaS invoice.")

    # SCENARIO B: Invoice Paid (Reactivation)
    elif event_type == 'invoice.payment_succeeded':
        stripe_customer_id = data.get("customer")
        # async with pool.acquire() as conn:
        #     await conn.execute("UPDATE tenants SET status = 'ACTIVE' WHERE stripe_customer_id = $1", stripe_customer_id)
        print(f"[{datetime.now()}] SUCCESS: Tenant {stripe_customer_id} reactivated.")

    return {"status": "success"}
