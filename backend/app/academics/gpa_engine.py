import asyncpg
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class GPAEngine:
    def __init__(self, db_pool: asyncpg.Pool):
        self.pool = db_pool

    async def calculate_student_cgpa(self, tenant_id: str, student_id: str) -> Dict[str, float]:
        """
        Executes a highly optimized, raw SQL aggregation to compute the CGPA directly 
        at the Postgres C-extension level, avoiding N+1 queries in Python.
        
        Strictly considers only grades where the status is 'PUBLISHED' or 'LOCKED'.
        Disputed or draft grades are mathematically ignored.
        """
        query = """
        WITH valid_grades AS (
            SELECT 
                m.student_id,
                m.grade_points,
                c.credits,
                (m.grade_points * c.credits) AS quality_points
            FROM academics.exam_marks m
            JOIN master_data.courses c ON m.course_id = c.course_id
            WHERE m.tenant_id = $1 
              AND m.student_id = $2
              AND m.status IN ('PUBLISHED', 'LOCKED')
        )
        SELECT 
            SUM(quality_points) / NULLIF(SUM(credits), 0) AS cgpa,
            SUM(credits) as total_credits
        FROM valid_grades;
        """
        
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(query, tenant_id, student_id)
                
                if row and row['cgpa'] is not None:
                    return {
                        "cgpa": round(float(row['cgpa']), 2),
                        "total_credits": float(row['total_credits'])
                    }
                return {"cgpa": 0.0, "total_credits": 0.0}
        except Exception as e:
            logger.error(f"Failed to compute CGPA for {student_id}: {e}")
            raise
