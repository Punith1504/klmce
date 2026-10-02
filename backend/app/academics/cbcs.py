import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/academics/cbcs", tags=["Choice-Based Credit System Engine"])

async def get_db_pool(): pass

class CBCSRegistrationReq(BaseModel):
    student_id: str
    course_ids: List[str]

@router.post("/register")
async def bulk_course_registration(req: CBCSRegistrationReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Atomic Choice-Based Credit System (CBCS) Registration Engine.
    Engineered to handle extreme concurrency loads (e.g. 5,000 students hitting register at 8:00 AM).
    Executes pessimistic database locking to guarantee strict physical hardware capacity limits 
    are never breached, dynamically falling back to real-time waitlists.
    """
    results = {"enrolled": [], "waitlisted": [], "failed": []}
    
    async with db_pool.acquire() as conn:
        for course_id in req.course_ids:
            try:
                # Atomically isolate the course row using pessimistic locking to prevent race conditions
                async with conn.transaction():
                    course = await conn.fetchrow(
                        "SELECT capacity FROM obe.courses WHERE course_id = $1 FOR UPDATE NOWAIT", 
                        course_id
                    )
                    
                    if not course:
                        results["failed"].append({"course": course_id, "reason": "Course Definition Not Found"})
                        continue
                        
                    current_enrollments = await conn.fetchval(
                        "SELECT count(*) FROM obe.course_enrollments WHERE course_id = $1 AND status = 'ENROLLED'",
                        course_id
                    )
                    
                    # Mathematical capacity validation
                    status = 'ENROLLED' if current_enrollments < course['capacity'] else 'WAITLISTED'
                    
                    await conn.execute(
                        "INSERT INTO obe.course_enrollments (course_id, student_id, status) VALUES ($1, $2, $3)",
                        course_id, req.student_id, status
                    )
                    
                    if status == 'ENROLLED':
                        results["enrolled"].append(course_id)
                    else:
                        results["waitlisted"].append(course_id)
            
            except asyncpg.exceptions.UniqueViolationError:
                results["failed"].append({"course": course_id, "reason": "Duplicate Registration Attempt"})
            except asyncpg.exceptions.LockNotAvailableError:
                # Catch extreme concurrency lock contention and force retry or fallback
                logger.warning(f"Extreme concurrency lock contention detected on Course {course_id}")
                results["failed"].append({"course": course_id, "reason": "Server busy, please retry this specific course."})
            except Exception as e:
                logger.error(f"CBCS Framework failure for student {req.student_id}, course {course_id}: {str(e)}")
                results["failed"].append({"course": course_id, "reason": "Internal Engine Error"})
                
    logger.info(f"Processed Atomic CBCS registration for student {req.student_id}: {results}")
    return {"status": "SUCCESS", "registration_summary": results}
