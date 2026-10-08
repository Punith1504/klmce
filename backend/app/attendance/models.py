import uuid
import enum
from sqlalchemy import Column, String, DateTime, Date, Time, UniqueConstraint, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"
    LOCKED = "LOCKED"

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    
    slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    section_id = Column(UUID(as_uuid=True), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), nullable=False)
    day_of_week = Column(String, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("tenant_id","student_id","slot_id","date",name="attendance_once"),)
    
    attendance_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("timetable_slots.slot_id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(SAEnum(AttendanceStatus, native_enum=False), nullable=False)
    marked_by = Column(UUID(as_uuid=True), nullable=False)
    override_justification = Column(String)
