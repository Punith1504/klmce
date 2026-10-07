import uuid
import time
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import require_roles, Role
from app.core.orm import get_db_session
from app.core.redis import get_redis_client
from app.core.rate_limit import student_scan_limit
from .schemas import ScanQRRequest, AdminOverrideRequest
from .models import TimetableSlot, AttendanceRecord
from .qr_crypto import generate_qr_payload, verify_and_decrypt_qr_payload

router=APIRouter()
CAMPUS_TZ=ZoneInfo("Asia/Kolkata")

def check_window(slot,now):
    if isinstance(slot.start_time,datetime):
        start=slot.start_time
    else:
        local=now.astimezone(CAMPUS_TZ)
        if slot.day_of_week != local.strftime('%A'): raise HTTPException(403,"Class is not scheduled today")
        start=datetime.combine(local.date(),slot.start_time,tzinfo=CAMPUS_TZ)
    if not start <= now <= start+timedelta(minutes=10):
        raise HTTPException(403,"Normal attendance is allowed only within 10 minutes of class start")

@router.get("/slots/{slot_id}/qr")
async def generate_rolling_qr(slot_id:uuid.UUID,token:dict=Depends(require_roles(Role.FACULTY)),db:AsyncSession=Depends(get_db_session)):
    slot=await db.get(TimetableSlot,slot_id)
    if not slot or str(slot.tenant_id)!=token['tenant_id']: raise HTTPException(404,"Class not found")
    if str(slot.faculty_id)!=token['sub']: raise HTTPException(403,"Faculty not assigned")
    check_window(slot,datetime.now(timezone.utc))
    return {"qr_payload":generate_qr_payload(token['tenant_id'],str(slot_id),uuid.uuid4().hex),"expires_in_seconds":30}

@router.post("/scan")
async def scan_qr(req:ScanQRRequest,token:dict=Depends(require_roles(Role.STUDENT)),db:AsyncSession=Depends(get_db_session),redis_client=Depends(get_redis_client),rate_limit=Depends(student_scan_limit)):
    try:
        data=verify_and_decrypt_qr_payload(req.qr_payload)
        slot_id=uuid.UUID(data['slot_id'])
    except (ValueError,KeyError): raise HTTPException(400,"Invalid QR") from None
    if data['tenant_id']!=token['tenant_id']: raise HTTPException(403,"Tenant mismatch")
    if abs(int(time.time())-data['ts'])>30: raise HTTPException(400,"QR expired")
    slot=await db.get(TimetableSlot,slot_id)
    if not slot or str(slot.tenant_id)!=token['tenant_id']: raise HTTPException(404,"Class not found")
    now=datetime.now(timezone.utc); check_window(slot,now)
    student=await db.scalar(text("SELECT student_id FROM students WHERE tenant_id=:tenant AND user_id=:user AND section_id=:section"),
        {"tenant":uuid.UUID(token['tenant_id']),"user":uuid.UUID(token['sub']),"section":slot.section_id})
    if not student: raise HTTPException(403,"Student is not enrolled in this section")
    # Shared classroom QR is redeemable by every enrolled student. The database,
    # rather than a cache TTL, makes each student's write durable and idempotent.
    stmt=insert(AttendanceRecord).values(attendance_id=uuid.uuid4(),tenant_id=uuid.UUID(token['tenant_id']),
        student_id=student,slot_id=slot_id,date=now.astimezone(CAMPUS_TZ).date(),status='PRESENT',marked_by=uuid.UUID(token['sub']))
    await db.execute(stmt.on_conflict_do_nothing(constraint='attendance_once'))
    await db.commit()
    return {"message":"Attendance recorded"}

@router.post("/{attendance_id}/override")
async def override_attendance(attendance_id:uuid.UUID,req:AdminOverrideRequest,token:dict=Depends(require_roles(Role.INSTITUTION_ADMIN)),db:AsyncSession=Depends(get_db_session)):
    record=await db.get(AttendanceRecord,attendance_id,with_for_update=True)
    if not record or str(record.tenant_id)!=token['tenant_id']: raise HTTPException(404,"Attendance not found")
    if req.status.value=='LOCKED': raise HTTPException(422,"LOCKED is not an attendance outcome")
    if len(req.override_justification.strip())<20: raise HTTPException(422,"Detailed justification required")
    record.status=req.status.value
    record.override_justification=req.override_justification.strip()
    record.marked_by=uuid.UUID(token['sub'])
    await db.commit()
    return {"message":"Approved correction recorded in audit history"}

from pydantic import BaseModel, Field
from datetime import date as Date
from typing import Literal

class RosterRecord(BaseModel):
    studentId: uuid.UUID
    status: Literal['PRESENT','ABSENT']

class RosterSubmission(BaseModel):
    slotId: uuid.UUID
    date: Date
    records: list[RosterRecord] = Field(min_length=1,max_length=200)

@router.post('/roster')
async def submit_roster(req:RosterSubmission,token:dict=Depends(require_roles(Role.FACULTY)),db:AsyncSession=Depends(get_db_session)):
    slot=await db.get(TimetableSlot,req.slotId)
    if not slot or str(slot.tenant_id)!=token['tenant_id']: raise HTTPException(404,'Class not found')
    if str(slot.faculty_id)!=token['sub']: raise HTTPException(403,'Faculty not assigned')
    now=datetime.now(timezone.utc)
    check_window(slot,now)
    if req.date!=now.astimezone(CAMPUS_TZ).date(): raise HTTPException(422,'Only today can be submitted normally')
    ids=[r.studentId for r in req.records]
    if len(ids)!=len(set(ids)): raise HTTPException(422,'Duplicate student in batch')
    enrolled=(await db.execute(text('SELECT student_id FROM students WHERE tenant_id=:tenant AND section_id=:section AND student_id=ANY(:ids)'),
        {'tenant':uuid.UUID(token['tenant_id']),'section':slot.section_id,'ids':ids})).scalars().all()
    if set(enrolled)!=set(ids): raise HTTPException(403,'Batch contains an unenrolled student')
    values=[{'attendance_id':uuid.uuid4(),'tenant_id':uuid.UUID(token['tenant_id']),'slot_id':req.slotId,
        'student_id':r.studentId,'date':req.date,'status':r.status,'marked_by':uuid.UUID(token['sub'])} for r in req.records]
    stmt=insert(AttendanceRecord).values(values).on_conflict_do_nothing(constraint='attendance_once')
    result=await db.execute(stmt)
    if result.rowcount!=len(values):
        await db.rollback()
        raise HTTPException(409,'Some attendance already exists; use the documented correction process')
    await db.commit()
    return {'inserted_count':len(values)}
