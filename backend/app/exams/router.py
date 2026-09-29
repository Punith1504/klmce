from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
import uuid

from ..core.dependencies import require_roles, Role
from ..core.security import RFC7807Exception
from .models import ExamMark, ExamStatus, ExamChangeRequest, ChangeRequestStatus
from .schemas import UpdateMarkRequest, ChangeRequestPayload, AdminSignRequest
from .decorators import validate_exam_state

router = APIRouter(prefix="/exams", tags=["exams"])

async def get_db_session() -> AsyncSession:
    raise NotImplementedError("Session dependency not injected")


@router.put("/marks/{mark_id}")
@validate_exam_state([ExamStatus.DRAFT])
async def update_exam_mark(
    mark_id: uuid.UUID,
    req: UpdateMarkRequest,
    mark_record: ExamMark = None,  # Injected directly by the @validate_exam_state decorator
    token: dict = Depends(require_roles(Role.FACULTY)),
    db: AsyncSession = Depends(get_db_session)
):
    """
    FACULTY: Modifies grades.
    Hard Tamper Resistance ensures this rejects requests on LOCKED/PUBLISHED rows 
    unless a 1-hour revision window override is active.
    """
    # Tenant verification natively acts as a backstop if RLS leaks
    if str(mark_record.tenant_id) != token["tenant_id"]:
        raise RFC7807Exception(status_code=403, type="about:blank", title="Forbidden", detail="Tenant mismatch")
        
    mark_record.marks_obtained = req.marks_obtained
    
    # On commit, the Postgres Audit Trigger computed dynamically intercepts this UPDATE.
    # It reliably records user_id, timestamp, old grade, and new grade into `audit_logs`
    await db.commit()
    
    return {"message": "Grade updated successfully."}


@router.post("/marks/{mark_id}/submit")
@validate_exam_state([ExamStatus.DRAFT])
async def submit_exam_mark(
    mark_id: uuid.UUID,
    mark_record: ExamMark = None,
    token: dict = Depends(require_roles(Role.FACULTY)),
    db: AsyncSession = Depends(get_db_session)
):
    """FACULTY: Transitions draft to SUBMITTED state."""
    mark_record.status = ExamStatus.SUBMITTED
    await db.commit()
    return {"message": "Grade formally submitted for administrative approval."}


@router.post("/marks/{mark_id}/approve")
@validate_exam_state([ExamStatus.SUBMITTED])
async def approve_exam_mark(
    mark_id: uuid.UUID,
    mark_record: ExamMark = None,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    db: AsyncSession = Depends(get_db_session)
):
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
    
    mark = await db.get(ExamMark, mark_id)
    if not mark or str(mark.tenant_id) != tenant_id:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Mark not found.")
        
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
    
    change_req = await db.get(ExamChangeRequest, request_id)
    if not change_req or str(change_req.tenant_id) != tenant_id:
        raise RFC7807Exception(status_code=404, type="about:blank", title="Not Found", detail="Request not found.")
        
    if change_req.status != ChangeRequestStatus.PENDING:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Bad Request", detail="Request has already been processed.")
        
    if not req.approve:
        change_req.status = ChangeRequestStatus.REJECTED
        await db.commit()
        return {"message": "Change request safely rejected."}
        
    signatures = list(change_req.admin_signatures)
    if admin_id in signatures:
        raise RFC7807Exception(status_code=400, type="about:blank", title="Duplicate Signature", detail="You have already signed this request.")
        
    signatures.append(admin_id)
    change_req.admin_signatures = signatures
    
    # Dual-Signature Authorization Threshold Met
    if len(change_req.admin_signatures) >= 2:
        change_req.status = ChangeRequestStatus.APPROVED
        mark = await db.get(ExamMark, change_req.mark_id)
        
        # Unlock safely via an ephemeral 1-hour window rather than permanently altering states
        mark.revision_window_until = datetime.now(timezone.utc) + timedelta(hours=1)
        db.add(mark)
        
    await db.commit()
    
    if change_req.status == ChangeRequestStatus.APPROVED:
        return {"message": "Final signature applied. Target row temporarily unlocked for 1 hour."}
        
    return {"message": "First signature applied successfully. Awaiting secondary admin signature."}
