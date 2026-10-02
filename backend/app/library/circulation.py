import logging
from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/library", tags=["Library RFID Circulation & Hardware"])

# Active WebSockets maintaining persistent connections to physical IoT Gates (Sirens/Lights)
active_hardware_alarms: Dict[str, WebSocket] = {}

# Mock dependency
async def get_db_pool(): pass

@router.websocket("/ws/hardware/{gate_id}")
async def library_anti_theft_gate_websocket(websocket: WebSocket, gate_id: str):
    """
    IoT Hardware Integration.
    Physical turnstiles and exit gates connect here. The backend can instantly
    trigger flashing lights and physical sirens via WebSocket RPC commands.
    """
    await websocket.accept()
    active_hardware_alarms[gate_id] = websocket
    logger.info(f"IoT Hardware Gate {gate_id} online and armed.")
    try:
        while True:
            await websocket.receive_text() # Keep-alive ping
    except WebSocketDisconnect:
        del active_hardware_alarms[gate_id]
        logger.warning(f"IoT Hardware Gate {gate_id} went offline.")

class RFIDScanPayload(BaseModel):
    tenant_id: str
    gate_id: str
    student_id: Optional[str] = None # Nullable if just an anti-theft scan without student ID card
    epc_tags: List[str] # Batch array of physical book RFID Electronic Product Codes

@router.post("/rfid/scan")
async def process_batch_rfid_scan(payload: RFIDScanPayload, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    High-Throughput Ingestion Engine.
    Handles payloads from RFID wands, Self-Checkout Kiosks, and Anti-Theft Exit Gates.
    """
    async with db_pool.acquire() as conn:
        for rfid_epc in payload.epc_tags:
            
            # 1. Fetch physical book metadata
            copy = await conn.fetchrow(
                "SELECT copy_id, status FROM library.book_copies WHERE rfid_epc = $1", 
                rfid_epc
            )
            
            if not copy:
                logger.warning(f"Unknown RFID EPC scanned: {rfid_epc}")
                continue
                
            # ========================================================
            # 2. ANTI-THEFT ALARM TRIGGER (Exit Gates)
            # ========================================================
            # If the book passes the exit gate, but its status in the DB is still 'AVAILABLE',
            # it means the student did not checkout the book. It is being stolen.
            if payload.gate_id.startswith("EXIT_GATE_") and copy['status'] == 'AVAILABLE':
                logger.critical(f"🚨 UNAUTHORIZED EXIT! Book {rfid_epc} is leaving the perimeter unchecked.")
                
                # Instantly trigger the physical hardware alarm
                if payload.gate_id in active_hardware_alarms:
                    alarm_ws = active_hardware_alarms[payload.gate_id]
                    await alarm_ws.send_json({
                        "command": "TRIGGER_ALARM",
                        "severity": "CRITICAL",
                        "duration_sec": 15,
                        "message": "Unchecked library asset detected."
                    })
                continue
                
            # ========================================================
            # 3. SELF-CHECKOUT KIOSK LOGIC
            # ========================================================
            if payload.gate_id.startswith("KIOSK_") and payload.student_id:
                
                # Quota Validation
                active_loans = await conn.fetchval(
                    "SELECT count(*) FROM library.book_loans WHERE student_id = $1 AND status = 'ACTIVE'",
                    payload.student_id
                )
                
                MAX_LOANS = 5 # Defined by institutional policy
                if active_loans >= MAX_LOANS:
                    raise HTTPException(status_code=403, detail="Checkout blocked: Maximum book loan quota exceeded.")
                
                # Disciplinary & Financial Validation (Cross-module checks)
                unpaid_fines = await conn.fetchval(
                    "SELECT COALESCE(SUM(amount), 0) FROM finance.fee_transactions WHERE student_id = $1 AND status = 'PENDING' AND description LIKE '%Library%'",
                    payload.student_id
                )
                
                if unpaid_fines > 500: # Exceeds threshold
                    raise HTTPException(status_code=403, detail="Checkout blocked: Account frozen due to excessive unpaid library fines.")
                
                # Process atomic checkout within a transaction
                async with conn.transaction():
                    await conn.execute("UPDATE library.book_copies SET status = 'LOANED' WHERE copy_id = $1", copy['copy_id'])
                    
                    # Due in exactly 14 days
                    await conn.execute(
                        """
                        INSERT INTO library.book_loans (tenant_id, student_id, copy_id, due_date)
                        VALUES ($1, $2, $3, NOW() + INTERVAL '14 days')
                        """,
                        payload.tenant_id, payload.student_id, copy['copy_id']
                    )
                    
    return {"status": "SUCCESS", "message": f"Processed {len(payload.epc_tags)} RFID tags successfully."}
