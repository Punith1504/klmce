from fastapi import APIRouter, Depends, status
import asyncpg
from typing import List
import uuid
from datetime import datetime
from ..core.dependencies import get_db_connection, require_roles, Role
from ..core.security import RFC7807Exception
from .schemas import TimetableSlotCreate, TimetableSlotResponse

router = APIRouter(prefix="/api/v1/timetable", tags=["timetable"])

@router.post("/slots", status_code=status.HTTP_201_CREATED, response_model=TimetableSlotResponse)
async def create_timetable_slot(
    slot: TimetableSlotCreate,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO timetable_slots 
            (course_id, section_id, faculty_id, room_number, day_of_week, start_time, end_time, tenant_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            """,
            slot.course_id, slot.section_id, slot.faculty_id, slot.room_number, 
            slot.day_of_week, slot.start_time, slot.end_time, uuid.UUID(token["tenant_id"])
        )
        return dict(row)
    except asyncpg.exceptions.ExclusionViolationError as e:
        detail_msg = str(e)
        if "prevent_room_overlap" in detail_msg:
            raise RFC7807Exception(status_code=409, type="probs/room-overlap", title="Room Conflict", detail="The designated room is already booked for this time slot.")
        elif "prevent_faculty_double_booking" in detail_msg:
            raise RFC7807Exception(status_code=409, type="probs/faculty-overlap", title="Faculty Conflict", detail="The assigned faculty member is already teaching another course during this time slot.")
        else:
            raise RFC7807Exception(status_code=409, type="probs/timetable-conflict", title="Timetable Conflict", detail="A scheduling conflict occurred.")

@router.get("/faculty/active-slot", response_model=TimetableSlotResponse)
async def get_active_faculty_slot(
    token: dict = Depends(require_roles(Role.FACULTY)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    # Retrieve local system time (for the ERP locale)
    now = datetime.now()
    current_time = now.time()
    current_day = now.strftime('%A')
    
    # Resolves slot based on start_time and a 15 minute grace period appended to end_time
    row = await conn.fetchrow(
        """
        SELECT * FROM timetable_slots
        WHERE faculty_id = $1
          AND day_of_week = $2::day_of_week_enum
          AND start_time <= $3
          AND $3 <= (end_time + interval '15 minutes')::time
        LIMIT 1
        """,
        uuid.UUID(token["sub"]), current_day, current_time
    )
    
    if not row:
        raise RFC7807Exception(
            status_code=404, 
            type="probs/no-active-slot", 
            title="No Active Slot", 
            detail="There is no active lecture assigned to you at the current time."
        )
    return dict(row)

@router.get("/section/{section_id}", response_model=List[TimetableSlotResponse])
async def get_section_timetable(
    section_id: uuid.UUID,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN, Role.FACULTY, Role.STUDENT)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    rows = await conn.fetch(
        """
        SELECT * FROM timetable_slots
        WHERE section_id = $1
        ORDER BY 
            array_position(ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']::day_of_week_enum[], day_of_week), 
            start_time
        """,
        section_id
    )
    return [dict(row) for row in rows]
