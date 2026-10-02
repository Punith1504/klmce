import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
from decimal import Decimal

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/finance/billing", tags=["Student Ledgers & Billing Config"])

async def get_db_pool(): pass

class AssignScholarshipReq(BaseModel):
    student_id: str
    sub_account: str
    waiver_amount: float
    reason: str

@router.post("/scholarships/assign")
async def assign_scholarship_waiver(req: AssignScholarshipReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Custom Scholarship & Waiver Engine.
    Dynamically applies fee waivers to specific ledger sub-accounts (e.g., waiving Hostel fees 
    while retaining Academic fees). Atomically updates ledger aggregates preventing double-spending.
    """
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # 1. Fetch Isolated Sub-Account Ledger
            ledger = await conn.fetchrow(
                "SELECT ledger_id FROM finance.student_ledgers WHERE student_id = $1 AND sub_account = $2 FOR UPDATE",
                req.student_id, req.sub_account
            )
            if not ledger:
                raise HTTPException(status_code=404, detail="Ledger sub-account not found.")
                
            # 2. Append Waiver Transaction
            await conn.execute(
                """
                INSERT INTO finance.transactions (ledger_id, amount, txn_type, payment_mode, status, reference_id)
                VALUES ($1, $2, 'WAIVER', 'SYSTEM', 'COMPLETED', $3)
                """,
                ledger['ledger_id'], req.waiver_amount, req.reason
            )
            
            # 3. Synchronize Ledger Aggregate
            await conn.execute(
                "UPDATE finance.student_ledgers SET total_waivers = total_waivers + $1 WHERE ledger_id = $2",
                req.waiver_amount, ledger['ledger_id']
            )
            
    logger.info(f"Assigned ₹{req.waiver_amount} scholarship waiver to Student {req.student_id} ({req.sub_account})")
    return {"status": "SUCCESS", "message": "Scholarship applied and ledger balanced successfully."}
