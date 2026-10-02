import logging
import datetime
import secrets
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
import asyncpg

try:
    from app.messaging.tasks import send_whatsapp_text
except ImportError:
    send_whatsapp_text = None

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/hostel/curfew", tags=["Biometrics & Curfew Security"])

# Mock DB pool dependency
async def get_db_pool(): pass

# =======================================================
# Night-Out Pass Workflow
# =======================================================
class NightOutRequest(BaseModel):
    student_id: str
    departure_time: datetime.datetime
    return_time: datetime.datetime
    reason: str
    parent_phone: str

@router.post("/request-pass")
async def request_night_out_pass(req: NightOutRequest, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Step 1: Student requests a pass.
    Generates a secure, 1-click tokenized magic link sent directly to the Parent's WhatsApp.
    """
    magic_token = secrets.token_urlsafe(48) # Cryptographically secure URL token
    
    # Store request in DB (Simulated)
    # await conn.execute("INSERT INTO residential.night_out_passes ...", magic_token)
    
    # Dispatch automated Meta Cloud API WhatsApp to the parent
    if send_whatsapp_text:
        approval_link = f"https://erp.klmce.edu/parent/approve-pass?token={magic_token}"
        message = (
            f"🚨 *Night Out Request - KLMCE*\n\n"
            f"Your ward has requested to leave the hostel campus.\n"
            f"Reason: {req.reason}\n"
            f"Departure: {req.departure_time.strftime('%Y-%m-%d %H:%M')}\n\n"
            f"Tap the secure link to instantly Approve/Deny:\n{approval_link}"
        )
        send_whatsapp_text.delay(req.parent_phone, message)
    
    return {"status": "PENDING_PARENT_APPROVAL", "message": "Magic link dispatched to Parent."}

# =======================================================
# Biometric Turnstile Integration
# =======================================================
class TurnstileScan(BaseModel):
    student_id: str
    hardware_id: str
    direction: str # 'IN' or 'OUT'
    timestamp: datetime.datetime

@router.post("/turnstile-webhook")
async def handle_turnstile_scan(scan: TurnstileScan, background_tasks: BackgroundTasks, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    IoT Webhook receiver for Hardware Biometric Turnstiles (Fingerprint/Face Scanners)
    mounted at the entrance of hostel blocks.
    """
    # 1. Log the physical biometric scan
    # await conn.execute("INSERT INTO residential.turnstile_logs ...")
    logger.info(f"Turnstile {scan.hardware_id}: Student {scan.student_id} scanned {scan.direction}")
    
    # 2. Curfew Evaluation Engine
    CURFEW_HOUR = 21 # 9:00 PM Strict Curfew
    
    if scan.direction == "OUT":
        if scan.timestamp.hour >= CURFEW_HOUR:
            # Check for an active, Warden-approved Night-Out Pass (Simulated Query)
            # has_active_pass = await conn.fetchval("SELECT true FROM residential.night_out_passes WHERE warden_approval_status = 'APPROVED'...")
            has_active_pass = False 
            
            if not has_active_pass:
                # Discard processing on the main thread and fire background alerts instantly
                background_tasks.add_task(trigger_curfew_violation_alert, scan.student_id)
                return {"status": "SECURITY_ALERT_TRIGGERED", "message": "Curfew breach detected."}
                
    return {"status": "LOGGED_OK"}

def trigger_curfew_violation_alert(student_id: str):
    """Executes high-priority SMS/WhatsApp dispatch to the Chief Warden and Parents."""
    logger.critical(f"CRITICAL CURFEW VIOLATION: Student {student_id} breached perimeter without authorization past 9:00 PM.")
    
    if send_whatsapp_text:
        # Mock Parent/Warden Phones
        warden_phone = "+1987654321" 
        parent_phone = "+1234567890"
        
        alert_msg = f"⚠️ *CRITICAL SECURITY ALERT*\nStudent {student_id} has scanned OUT of the hostel premises past the 9:00 PM curfew without an approved Night-Out Pass."
        
        send_whatsapp_text.delay(warden_phone, alert_msg)
        send_whatsapp_text.delay(parent_phone, alert_msg)
