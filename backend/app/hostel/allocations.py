import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/hostel", tags=["Residential Room Allocations"])

class AllocateBedRequest(BaseModel):
    tenant_id: str
    student_id: str
    bed_id: str
    security_deposit_amount: float

# Mock dependency for the DB pool in this modular file
async def get_db_pool():
    # In production, this yields the FastAPI app.state.db_pool
    pass 

@router.post("/allocate")
async def allocate_hostel_bed(req: AllocateBedRequest, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Atomic Bed Allocation & Financial Ledger Synchronization.
    Executes entirely within a single PostgreSQL ACID transaction to prevent race conditions.
    """
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # 1. Row-Level Pessimistic Locking
            # Lock the bed row immediately using 'FOR UPDATE NOWAIT'
            # If two wardens click "Allocate" at the exact same millisecond, the second query fails instantly.
            bed_status = await conn.fetchval(
                "SELECT is_occupied FROM residential.beds WHERE bed_id = $1 FOR UPDATE NOWAIT",
                req.bed_id
            )
            
            if bed_status is None:
                raise HTTPException(status_code=404, detail="Bed identifier not found in inventory.")
                
            if bed_status is True:
                raise HTTPException(status_code=409, detail="CRITICAL ERROR: Double-booking prevented. This bed is already occupied.")
            
            # 2. Mark the bed inventory as occupied
            await conn.execute("UPDATE residential.beds SET is_occupied = TRUE WHERE bed_id = $1", req.bed_id)
            
            # 3. Insert the active room allocation record
            await conn.execute(
                """
                INSERT INTO residential.room_allocations (tenant_id, student_id, bed_id, status)
                VALUES ($1, $2, $3, 'ACTIVE')
                """,
                req.tenant_id, req.student_id, req.bed_id
            )
            
            # 4. Atomic Financial Ledger Sync
            # Directly map the security deposit to the append-only fee_transactions ledger.
            # If this fails, the bed allocation rolls back automatically.
            await conn.execute(
                """
                INSERT INTO finance.fee_transactions (tenant_id, student_id, amount, transaction_type, description)
                VALUES ($1, $2, $3, 'DEBIT', 'Hostel Security Deposit & Initial Room Fee')
                """,
                req.tenant_id, req.student_id, req.security_deposit_amount
            )
            
            logger.info(f"Successfully allocated Bed {req.bed_id} to Student {req.student_id} atomically.")
            
    return {"status": "SUCCESS", "message": "Bed allocated, inventory locked, and deposit mapped to the financial ledger."}
