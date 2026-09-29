from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
import redis.asyncio as redis
import uuid
import time

from ..core.dependencies import require_roles, Role
from ..core.security import RFC7807Exception
from .schemas import ScanQRRequest, AdminOverrideRequest, AttendanceStatus
from .models import TimetableSlot, AttendanceRecord
from .qr_crypto import generate_qr_payload, verify_and_decrypt_qr_payload

router = APIRouter(prefix="/attendance", tags=["attendance"])

# Mock dependencies to be injected by the actual application framework
async def get_db_session() -> AsyncSession:
    raise NotImplementedError("Session dependency not injected")

async def get_redis_client() -> redis.Redis:
    raise NotImplementedError("Redis dependency not injected")


@router.get("/slots/{slot_id}/qr")
async def generate_rolling_qr(
    slot_id: uuid.UUID,
    token: dict = Depends(require_roles(Role.FACULTY)),
    db: AsyncSession = Depends(get_db_session)
):
    """
    FACULTY only: Generate a dynamic QR payload for classrooms, rotating every 15s.
    Enforces strict timetable-bound logic and post-lecture locking.
    """
    tenant_id = token["tenant_id"]
    faculty_id = token["sub"]
    
    # 1. Fetch the slot (assuming RLS covers tenant isolation, but we enforce it here explicitly for safety)
    slot = await db.get(TimetableSlot, slot_id)
    if not slot or str(slot.tenant_id) != tenant_id:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Slot not found.")
    
    # 2. Verify slot belongs to the faculty
    if str(slot.faculty_id) != faculty_id:
        raise RFC7807Exception(status_code=403, type="about:blank", title="Forbidden", detail="You are not assigned to teach this slot.")
    
    now = datetime.now(timezone.utc)
    
    # 3. Check boundaries including the 15-minute grace period
    if now < slot.start_time:
        raise RFC7807Exception(status_code=403, type="about:blank", title="Locked", detail="This class has not started yet.")
        
    if now > slot.end_time + timedelta(minutes=15):
        raise RFC7807Exception(status_code=403, type="about:blank", title="Locked", detail="The attendance register is locked as the grace period has elapsed.")
        
    # Generate cryptographic payload
    nonce = uuid.uuid4().hex
    payload = generate_qr_payload(tenant_id, str(slot_id), nonce)
    
    return {"qr_payload": payload, "expires_in_seconds": 15}


@router.post("/scan")
async def scan_qr(
    req: ScanQRRequest,
    token: dict = Depends(require_roles(Role.STUDENT)),
    db: AsyncSession = Depends(get_db_session),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    STUDENT only: Endpoint for students to scan the cryptographically secured QR codes.
    Implements Zero-Trust Replay Prevention.
    """
    tenant_id = token["tenant_id"]
    student_id = token["sub"]
    
    # 1. Decrypt & Verify HMAC Signature
    try:
        data = verify_and_decrypt_qr_payload(req.qr_payload)
    except ValueError as e:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Invalid QR", detail=str(e))
        
    if data["tenant_id"] != tenant_id:
        raise RFC7807Exception(status_code=403, type="about:blank", title="Forbidden", detail="Tenant mismatch in QR payload.")
        
    # 2. Enforce 30-second skew window from the payload timestamp
    current_ts = int(time.time())
    if abs(current_ts - data["ts"]) > 30:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Expired QR", detail="This QR code has expired. Please scan the current one.")
        
    # 3. Redis-based Nonce check for replay protection (60s TTL prevents redeeming same code twice)
    nonce_key = f"redeemed_nonce:{data['nonce']}"
    is_redeemed = await redis_client.get(nonce_key)
    if is_redeemed:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Replay Detected", detail="This QR code has already been scanned.")
    
    # Mark nonce as consumed
    await redis_client.setex(nonce_key, 60, "1")
    
    # 4. Final constraints check against Timetable slot
    slot_id = data["slot_id"]
    slot = await db.get(TimetableSlot, uuid.UUID(slot_id))
    if not slot:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Timetable slot not found.")
        
    now = datetime.now(timezone.utc)
    if now > slot.end_time + timedelta(minutes=15):
        raise RFC7807Exception(status_code=403, type="about:blank", title="Locked", detail="Attendance for this slot is locked.")
        
    # 5. Domain Verification: Check if student is enrolled in slot.section_id
    # (Implementation elided for brevity, would query enrollment table here)
    
    # Record Attendance
    record = AttendanceRecord(
        tenant_id=slot.tenant_id,
        slot_id=slot.slot_id,
        student_id=uuid.UUID(student_id),
        date=now,
        status=AttendanceStatus.PRESENT,
        marked_by=uuid.UUID(student_id)
    )
    db.add(record)
    await db.commit()
    
    return {"message": "Attendance marked successfully."}


@router.post("/{attendance_id}/override")
async def override_attendance(
    attendance_id: uuid.UUID,
    req: AdminOverrideRequest,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    db: AsyncSession = Depends(get_db_session)
):
    """
    INSTITUTION_ADMIN only: Administrative override of locked/past attendance records.
    Requires a detailed justification which automatically flows into the PostgreSQL audit stream.
    """
    tenant_id = token["tenant_id"]
    admin_id = token["sub"]
    
    record = await db.get(AttendanceRecord, attendance_id)
    if not record or str(record.tenant_id) != tenant_id:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Attendance record not found.")
        
    record.status = req.status
    record.override_justification = req.override_justification
    record.marked_by = uuid.UUID(admin_id)
    
    # The change commit will natively trigger the `audit_trigger_func` configured previously, 
    # persisting the `override_justification` mutation safely in `audit_logs`.
    await db.commit()
    return {"message": "Attendance overriden successfully. Activity logged."}
