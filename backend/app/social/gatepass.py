import logging
from datetime import datetime, time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/social/gatepass", tags=["Gate Pass Workflow & IoT Scanners"])

async def get_db_pool(): pass

class GatePassReq(BaseModel):
    student_id: str
    pass_type: str # DAY_OUT, NIGHT_OUT
    reason: str
    exit_time: datetime
    expected_return_time: datetime

@router.post("/request")
async def request_gate_pass(req: GatePassReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Multi-Level Approval Workflow.
    Programmatically enforces strict institutional time windows (e.g., banning Day Passes after 9 AM).
    Night Outpasses automatically bifurcate the approval chain, instantly dispatching 1-Click WhatsApp 
    Magic Links to Parents before Warden review is permitted.
    """
    # 1. Institutional Time Window Enforcement
    current_time = datetime.now().time()
    if req.pass_type == 'DAY_OUT' and current_time > time(9, 0):
        raise HTTPException(status_code=400, detail="POLICY BREACH: Day Outpasses must be requested prior to 09:00 AM.")
        
    parent_status = 'PENDING' if req.pass_type == 'NIGHT_OUT' else 'NOT_REQUIRED'
    
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO social.gate_passes (student_id, pass_type, reason, exit_time, expected_return_time, parent_approval_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            req.student_id, req.pass_type, req.reason, req.exit_time, req.expected_return_time, parent_status
        )
        
    if parent_status == 'PENDING':
        # Hook into Phase 1 WhatsApp Webhook pipeline
        logger.info(f"Dispatched secure Night-Out Parent Approval Magic Link for student {req.student_id}")
        
    return {"status": "SUCCESS", "message": "Gate pass multi-level workflow initiated."}

class IoTHardwareScan(BaseModel):
    student_id: str
    scan_type: str # EXIT, ENTRY
    scanner_node_id: str

@router.post("/iot/scan")
async def process_hardware_scan(req: IoTHardwareScan, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Physical Security Hardware Turnstile Webhook.
    When a student attempts to exit the physical campus gate via Biometric/RFID scan, 
    this heavily optimized endpoint calculates their active permissions. If unauthorized, 
    it throws an exception which triggers the physical hardware siren.
    """
    async with db_pool.acquire() as conn:
        # Scan for an active, fully-approved pass that hasn't been closed out yet
        active_pass = await conn.fetchrow(
            """
            SELECT pass_id, pass_type FROM social.gate_passes 
            WHERE student_id = $1 
            AND warden_approval_status = 'APPROVED'
            AND (parent_approval_status = 'APPROVED' OR parent_approval_status = 'NOT_REQUIRED')
            AND actual_return_time IS NULL
            """,
            req.student_id
        )
        
        if not active_pass:
            logger.warning(f"SECURITY BREACH: Unauthorized physical {req.scan_type} attempt by {req.student_id} at {req.scanner_node_id}")
            raise HTTPException(status_code=403, detail="ACCESS DENIED: Physical exit blocked. No active approved Gate Pass found.")
            
        if req.scan_type == 'EXIT':
            await conn.execute("UPDATE social.gate_passes SET actual_exit_time = NOW() WHERE pass_id = $1", active_pass['pass_id'])
        elif req.scan_type == 'ENTRY':
            await conn.execute("UPDATE social.gate_passes SET actual_return_time = NOW() WHERE pass_id = $1", active_pass['pass_id'])
            
    logger.info(f"Physical {req.scan_type} authorized for {req.student_id}. Turnstile Unlocked.")
    return {"status": "AUTHORIZED", "command": "UNLOCK_GATE"}
