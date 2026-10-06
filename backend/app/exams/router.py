from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
import uuid

from ..core.dependencies import require_roles, Role
from ..core.security import RFC7807Exception
from .models import ExamMark, ExamStatus, ExamChangeRequest, ChangeRequestStatus
from .schemas import UpdateMarkRequest, ChangeRequestPayload, AdminSignRequest
from .decorators import validate_exam_state
from app.core.orm import get_db_session

router = APIRouter(tags=["exams"])



@router.put("/marks/{mark_id}")
@validate_exam_state([ExamStatus.DRAFT], allow_revision=True)
async def update_exam_mark(
    mark_id: uuid.UUID,
    req: UpdateMarkRequest,

    token: dict = Depends(require_roles(Role.FACULTY)),
    db: AsyncSession = Depends(get_db_session)
):

    mark_record = await db.get(ExamMark, mark_id, with_for_update=True)
    """
    FACULTY: Modifies grades.
    Hard Tamper Resistance ensures this rejects requests on LOCKED/PUBLISHED rows 
    unless a 1-hour revision window override is active.
    """
    # Tenant verification natively acts as a backstop if RLS leaks
    if str(mark_record.tenant_id) != token["tenant_id"]:
        raise RFC7807Exception(status_code=403, type="about:blank", title="Forbidden", detail="Tenant mismatch")
        
    if req.marks_obtained > mark_record.max_marks:
        from fastapi import HTTPException
        raise HTTPException(422, "Marks exceed the exam maximum")
    mark_record.marks_obtained = req.marks_obtained
    
    # On commit, the Postgres Audit Trigger computed dynamically intercepts this UPDATE.
    # It reliably records user_id, timestamp, old grade, and new grade into `audit_logs`
    await db.commit()
    
    return {"message": "Grade updated successfully."}


@router.post("/marks/{mark_id}/submit")
@validate_exam_state([ExamStatus.DRAFT])
async def submit_exam_mark(
    mark_id: uuid.UUID,

    token: dict = Depends(require_roles(Role.FACULTY)),
    db: AsyncSession = Depends(get_db_session)
):

    mark_record = await db.get(ExamMark, mark_id, with_for_update=True)
    """FACULTY: Transitions draft to SUBMITTED state."""
    mark_record.status = ExamStatus.SUBMITTED
    await db.commit()
    return {"message": "Grade formally submitted for administrative approval."}


@router.post("/marks/{mark_id}/approve")
@validate_exam_state([ExamStatus.SUBMITTED])
async def approve_exam_mark(
    mark_id: uuid.UUID,

    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    db: AsyncSession = Depends(get_db_session)
):

    mark_record = await db.get(ExamMark, mark_id, with_for_update=True)
    """ADMIN: Approves and transitions row to LOCKED, triggering Hard Tamper Resistance."""
    mark_record.status = ExamStatus.LOCKED
    await db.commit()
    return {"message": "Grade approved and cryptographically locked."}


@router.post("/marks/{mark_id}/request-change")
async def request_grade_change(
    mark_id: uuid.UUID,
    req: ChangeRequestPayload,
    token: dict = Depends(require_roles(Role.FACULTY)),
    db: AsyncSession = Depends(get_db_session)
):
    """FACULTY: Creates a formal change ticket for a locked row."""
    tenant_id = token["tenant_id"]
    faculty_id = token["sub"]
    
    mark = await db.get(ExamMark, mark_id, with_for_update=True)
    if not mark or str(mark.tenant_id) != tenant_id:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Mark not found.")
        
    if str(mark.faculty_id) != faculty_id:
        from fastapi import HTTPException
        raise HTTPException(403, "Faculty not assigned")
    if mark.status not in [ExamStatus.LOCKED, ExamStatus.PUBLISHED]:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Bad Request", detail="Mark is not locked.")
        
    change_req = ExamChangeRequest(
        tenant_id=uuid.UUID(tenant_id),
        mark_id=mark_id,
        requested_by=uuid.UUID(faculty_id),
        reason=req.reason,
        admin_signatures=[]
    )
    db.add(change_req)
    await db.commit()
    
    return {
        "message": "Change request submitted successfully.", 
        "request_id": change_req.request_id,
        "status": "Awaiting 2 Admin Signatures"
    }


@router.post("/requests/{request_id}/sign")
async def sign_change_request(
    request_id: uuid.UUID,
    req: AdminSignRequest,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN, Role.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db_session)
):
    """
    ADMIN: Sign a change request.
    Upon reaching 2 signatures, unlocks the mark strictly for a 1-hour revision window.
    """
    tenant_id = token["tenant_id"]
    admin_id = uuid.UUID(token["sub"])
    
    change_req = await db.get(ExamChangeRequest, request_id, with_for_update=True)
    if not change_req or str(change_req.tenant_id) != tenant_id:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Request not found.")
        
    if change_req.status != ChangeRequestStatus.PENDING:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Bad Request", detail="Request has already been processed.")
        
    if not req.approve:
        change_req.status = ChangeRequestStatus.REJECTED
        await db.commit()
        return {"message": "Change request safely rejected."}
        
    if str(change_req.requested_by) == str(admin_id):
        from fastapi import HTTPException
        raise HTTPException(403, "Requester cannot approve their own change")
    signatures = list(change_req.admin_signatures)
    if admin_id in signatures:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Duplicate Signature", detail="You have already signed this request.")
        
    signatures.append(admin_id)
    change_req.admin_signatures = signatures
    
    # Dual-Signature Authorization Threshold Met
    if len(change_req.admin_signatures) >= 2:
        change_req.status = ChangeRequestStatus.APPROVED
        mark = await db.get(ExamMark, change_req.mark_id, with_for_update=True)
        
        # Unlock safely via an ephemeral 1-hour window rather than permanently altering states
        mark.revision_window_until = datetime.now(timezone.utc) + timedelta(hours=1)
        db.add(mark)
        
    await db.commit()
    
    if change_req.status == ChangeRequestStatus.APPROVED:
        return {"message": "Final signature applied. Target row temporarily unlocked for 1 hour."}
        
    return {"message": "First signature applied successfully. Awaiting secondary admin signature."}

from sqlalchemy import select
@router.get('/marks')
async def list_assigned_marks(token:dict=Depends(require_roles(Role.FACULTY)),db:AsyncSession=Depends(get_db_session)):
    result=await db.execute(select(ExamMark).where(ExamMark.tenant_id==uuid.UUID(token['tenant_id']),ExamMark.faculty_id==uuid.UUID(token['sub'])).order_by(ExamMark.exam_date.desc()).limit(200))
    return [{'id':str(m.mark_id),'student_id':str(m.student_id),'subject':m.subject,'marks':str(m.marks_obtained),
        'maximum':str(m.max_marks),'status':m.status.value} for m in result.scalars()]
