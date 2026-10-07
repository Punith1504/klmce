from pydantic import BaseModel, Field
from decimal import Decimal
import enum

class ExamStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    LOCKED = "LOCKED"
    PUBLISHED = "PUBLISHED"

class UpdateMarkRequest(BaseModel):
    marks_obtained: Decimal = Field(..., max_digits=5, decimal_places=2, ge=0)

class ChangeRequestPayload(BaseModel):
    reason: str = Field(..., min_length=10, max_length=2000, description="Justification required for audit tracking.")

class AdminSignRequest(BaseModel):
    approve: bool = Field(..., description="Set true to append signature, false to reject request.")
