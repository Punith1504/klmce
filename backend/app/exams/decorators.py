from functools import wraps
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from typing import List

from .models import ExamMark, ExamStatus

class RecordIsLockedException(HTTPException):
    def __init__(self, detail: str = "409 Conflict: Record is locked and cannot be modified"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

def validate_exam_state(allowed_states: List[ExamStatus], allow_revision: bool = False):
    """
    Decorator to wrap FastAPI path operations.
    Validates state machine status strictly, preventing updates to LOCKED or PUBLISHED rows,
    while gracefully bypassing locks if an active administrative revision window exists.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            mark_id = kwargs.get("mark_id")
            db: AsyncSession = kwargs.get("db")
            
            if not mark_id or not db:
                # If dependency injection failed or kwargs misaligned, fallback to raw execution
                raise HTTPException(400, "Record and database context are required")
                
            mark = await db.get(ExamMark, mark_id, with_for_update=True)
            if not mark:
                raise HTTPException(status_code=404, detail="Exam mark not found")
                
            token = kwargs.get("token", {})
            if str(mark.tenant_id) != token.get("tenant_id"):
                raise HTTPException(404, "Exam mark not found")
            if token.get("role") == "FACULTY" and str(mark.faculty_id) != token.get("sub"):
                raise HTTPException(403, "Faculty not assigned")
            now = datetime.now(timezone.utc)
            
            # 1. Override Window Exemption Check
            override_active = False
            if allow_revision and mark.revision_window_until and now <= mark.revision_window_until:
                override_active = True
                
            # 2. Strict State Check
            if not override_active and mark.status not in allowed_states:
                raise RecordIsLockedException(f"Exam record is currently {mark.status.value}. An authorized override is required to modify it.")
                
            # Optimize: Inject the fetched mark directly back into the kwargs to save a redundant DB hit in the router
            # Handler reads the same locked row from the identity map.
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
