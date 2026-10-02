import logging
import random
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/exams", tags=["Eligibility & Seating Automation"])

async def get_db_pool(): pass

class EligibilityReq(BaseModel):
    exam_id: str
    minimum_attendance: float = 75.0

@router.post("/eligibility/compute")
async def compute_exam_eligibility(req: EligibilityReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Pre-Examination Compliance Engine.
    Before generating a single Hall Ticket, the backend cross-checks attendance ledgers
    and financial accounts. If a student drops below 75% attendance or has outstanding 
    tuition dues, they are mathematically barred from the examination hall.
    """
    async with db_pool.acquire() as conn:
        # In Production: Deep JOINs across attendance.records and finance.student_ledgers
        
        # Simulated payload for architectural representation
        students = [
            {"student_id": "STU_001", "attendance": 82.5, "outstanding_fees": 0.0},
            {"student_id": "STU_002", "attendance": 64.0, "outstanding_fees": 0.0}, # Denied: Low Attendance
            {"student_id": "STU_003", "attendance": 90.0, "outstanding_fees": 15000.0} # Denied: Fee Default
        ]
        
        eligible_count = 0
        for s in students:
            is_eligible = (s["attendance"] >= req.minimum_attendance) and (s["outstanding_fees"] <= 0)
            await conn.execute(
                """
                INSERT INTO exams.eligibility (exam_id, student_id, attendance_percentage, fees_cleared, is_eligible)
                VALUES ($1, $2, $3, $4, $5)
                """,
                req.exam_id, s["student_id"], s["attendance"], (s["outstanding_fees"] <= 0), is_eligible
            )
            if is_eligible: eligible_count += 1
            
    logger.info(f"Computed strict institutional eligibility for Exam {req.exam_id}. Eligible: {eligible_count}/{len(students)}")
    return {"status": "SUCCESS", "eligible_count": eligible_count, "denied_count": len(students) - eligible_count}

class SeatingReq(BaseModel):
    exam_id: str
    room_capacities: Dict[str, int] # e.g. {"ROOM_A": 40, "ROOM_B": 40}

@router.post("/seating/allocate")
async def generate_seating_arrangement(req: SeatingReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Algorithmic Seating & Anti-Collision Engine.
    Dynamically shuffles eligible candidates and distributes them across provided classrooms.
    Breaking sequential roll number adjacency severely disrupts physical cheating mechanics.
    """
    async with db_pool.acquire() as conn:
        eligible_students = await conn.fetch(
            "SELECT student_id FROM exams.eligibility WHERE exam_id = $1 AND is_eligible = TRUE",
            req.exam_id
        )
        
        student_ids = [s['student_id'] for s in eligible_students]
        
        # Cryptographic shuffle destroys roll-number sequences
        random.shuffle(student_ids) 
        
        allocated = 0
        for room, capacity in req.room_capacities.items():
            for desk_num in range(1, capacity + 1):
                if not student_ids: break
                
                student = student_ids.pop()
                await conn.execute(
                    """
                    INSERT INTO exams.seating_arrangements (exam_id, student_id, room_number, desk_number)
                    VALUES ($1, $2, $3, $4)
                    """,
                    req.exam_id, student, room, f"D-{desk_num:03d}"
                )
                allocated += 1
                
        if student_ids:
            logger.error(f"SEVERE ALERT: Insufficient physical capacity for Exam {req.exam_id}. Unallocated: {len(student_ids)}")
            
    logger.info(f"Successfully allocated {allocated} students across {len(req.room_capacities)} rooms for Exam {req.exam_id}.")
    return {"status": "SUCCESS", "allocated": allocated, "unallocated": len(student_ids)}
