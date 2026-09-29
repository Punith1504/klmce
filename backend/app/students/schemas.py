from pydantic import BaseModel, constr
from typing import Optional
import uuid
from datetime import datetime

class StudentCreate(BaseModel):
    first_name: constr(min_length=1, max_length=100)
    last_name: constr(min_length=1, max_length=100)
    enrollment_number: constr(min_length=1, max_length=100)
    parent_id: Optional[uuid.UUID] = None

class StudentResponse(StudentCreate):
    student_id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ParentAssignRequest(BaseModel):
    parent_id: uuid.UUID
