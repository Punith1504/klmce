from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
import asyncpg
from app.core.database import get_db_connection
from app.core.security import RFC7807Exception

router = APIRouter()

# ==========================================
# Schemas
# ==========================================
class CourseResponse(BaseModel):
    course_id: str
    code: str
    name: str

class FacultyResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str

class TimetableSlotCreate(BaseModel):
    course_id: str
    section_id: str
    faculty_id: str
    room_number: str
    day_of_week: str
    start_time: str
    end_time: str

# ==========================================
# Endpoints
# ==========================================
@router.get("/courses", response_model=List[CourseResponse])
async def list_courses(conn: asyncpg.Connection = Depends(get_db_connection)):
    """
    Hydrates the Next.js TanStack query for the Drag-and-Drop Sidebar Palette.
    """
    query = "SELECT course_id::text, code, name FROM courses ORDER BY code ASC"
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

@router.get("/faculty", response_model=List[FacultyResponse])
async def list_faculty(conn: asyncpg.Connection = Depends(get_db_connection)):
    """
    Hydrates the Next.js TanStack query, isolating only users registered as FACULTY.
    """
    query = """
        SELECT user_id::text, first_name, last_name 
        FROM users 
        WHERE role = 'FACULTY' 
        ORDER BY last_name ASC
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

@router.post("/slots")
async def assign_timetable_slot(
    payload: TimetableSlotCreate, 
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Attempts to insert a dragged-and-dropped time block into the master matrix.
    Relies entirely on PostgreSQL GiST constraints to prevent physical collisions.
    """
    try:
        query = """
            INSERT INTO timetable_slots 
                (course_id, section_id, faculty_id, room_number, day_of_week, start_time, end_time)
            VALUES 
                ($1, $2, $3, $4, $5, $6::time, $7::time)
            RETURNING slot_id::text
        """
        
        row = await conn.fetchrow(
            query,
            payload.course_id,
            payload.section_id,
            payload.faculty_id,
            payload.room_number,
            payload.day_of_week,
            payload.start_time,
            payload.end_time
        )
        
        return {"status": "success", "slot_id": row["slot_id"]}
        
    except asyncpg.exceptions.ExclusionViolationError as e:
        # Zero-Trust Constraint Trap
        # The PostgreSQL Database physically blocked the insertion because the overlapping 
        # GiST exclusion rule detected that either the faculty or room is already active.
        raise RFC7807Exception(
            status_code=409,
            type="probs/timetable-collision",
            title="Scheduling Conflict",
            detail="Database physical constraint violated: The designated faculty member or classroom is already booked during this time window."
        )
