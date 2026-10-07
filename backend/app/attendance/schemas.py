from pydantic import BaseModel, Field, UUID4
from datetime import datetime
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"
    LOCKED = "LOCKED"

class ScanQRRequest(BaseModel):
    qr_payload: str = Field(..., max_length=4096, description="The cryptographically secured QR code string.")

class AdminOverrideRequest(BaseModel):
    status: AttendanceStatus
    override_justification: str = Field(
        ...,
        min_length=20, max_length=2000,
        description="Mandatory justification for administrative audit logs."
    )
