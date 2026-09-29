import uuid
from sqlalchemy import Column, String, Time, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"

    slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    course_id = Column(UUID(as_uuid=True), nullable=False)
    section_id = Column(UUID(as_uuid=True), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), nullable=False)
    room_number = Column(String(50), nullable=False)
    day_of_week = Column(ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', name='day_of_week_enum'), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    __table_args__ = (
        CheckConstraint('start_time < end_time', name='valid_time_range'),
        # Note: GiST exclusion constraints for overlaps are managed physically in PostgreSQL via init_schema.sql
    )
