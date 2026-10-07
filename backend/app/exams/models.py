import uuid
import enum
from sqlalchemy import Column, Boolean, String, Date, DateTime, Numeric, Enum as SAEnum, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ExamStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    LOCKED = "LOCKED"
    PUBLISHED = "PUBLISHED"

class ExamMark(Base):
    __tablename__ = "exam_marks"
    
    mark_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), nullable=False)
    schedule_id = Column(UUID(as_uuid=True), nullable=True)
    is_entered = Column(Boolean, nullable=False, default=True)
    subject = Column(String(100), nullable=False)
    marks_obtained = Column(Numeric(5, 2), nullable=False)
    max_marks = Column(Numeric(5, 2), nullable=False)
    exam_date = Column(Date, nullable=False)
    
    # State Machine Integration
    status = Column(SAEnum(ExamStatus, native_enum=False), default=ExamStatus.DRAFT, nullable=False)
    
    # Expiration window for overrides
    revision_window_until = Column(DateTime(timezone=True), nullable=True)

class ChangeRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ExamChangeRequest(Base):
    __tablename__ = "exam_change_requests"
    
    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    mark_id = Column(UUID(as_uuid=True), ForeignKey("exam_marks.mark_id"), nullable=False)
    requested_by = Column(UUID(as_uuid=True), nullable=False)
    reason = Column(String, nullable=False)
    status = Column(SAEnum(ChangeRequestStatus, native_enum=False), default=ChangeRequestStatus.PENDING, nullable=False)
    
    # Stores Admin signatures required to execute dual-approval unlocking
    admin_signatures = Column(ARRAY(UUID(as_uuid=True)), default=list)
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
