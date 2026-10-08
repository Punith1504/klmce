from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
import uuid
from datetime import time

class TimetableSlotCreate(BaseModel):
    course_id: uuid.UUID
    section_id: uuid.UUID
    faculty_id: uuid.UUID
    room_number: str = Field(min_length=1,max_length=50)
    day_of_week: str
    start_time: time
    end_time: time

    @model_validator(mode='after')
    def check_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError('start_time must be strictly before end_time')
        return self
        
    @field_validator('day_of_week')
    @classmethod
    def validate_day(cls, v: str) -> str:
        valid = {'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'}
        if v not in valid:
            raise ValueError(f'Invalid day of week, must be one of {valid}')
        return v

class TimetableSlotResponse(TimetableSlotCreate):
    slot_id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)
