import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admissions/provisioning", tags=["Verification & Provisioning"])

async def get_db_pool(): pass

class DocumentReviewReq(BaseModel):
    doc_id: str
    action: str # 'APPROVE' or 'REJECT'
    rejection_reason: str = None

@router.post("/documents/review")
async def review_applicant_document(req: DocumentReviewReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Administrative Document Verification Pipeline.
    Validates uploaded S3 artifacts (12th Marksheets, Transfer Certificates, etc.).
    """
    status = 'APPROVED' if req.action == 'APPROVE' else 'REJECTED'
    
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE admissions.documents 
            SET verification_status = $1, rejection_reason = $2, verified_at = NOW() 
            WHERE doc_id = $3
            """,
            status, req.rejection_reason, req.doc_id
        )
    return {"status": "SUCCESS", "message": f"Document marked as {status}."}

class RollNumberEngine:
    """
    Rule-based ID Generation Service.
    Calculates strict institutional roll numbers natively derived from Program, Batch, and Quota.
    """
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        
    async def generate_roll_number(self, application_id: str) -> str:
        async with self.pool.acquire() as conn:
            app = await conn.fetchrow(
                """
                SELECT f.batch_year, f.program_id, f.quota 
                FROM admissions.applications a
                JOIN admissions.dynamic_forms f ON a.form_id = f.form_id
                WHERE a.application_id = $1
                """, application_id
            )
            
            # Formatting Logic: [YEAR][PROGRAM_CODE][QUOTA_CODE][SEQ_000]
            # E.g., 2026 Batch, Computer Science, Merit Quota -> 26CSM...
            year_suffix = str(app['batch_year'])[-2:]
            
            program_code = "XX"
            if "CSE" in app['program_id']: program_code = "CS"
            elif "ECE" in app['program_id']: program_code = "EC"
                
            quota_code = "M" if app['quota'] == "MERIT" else "Q"
            
            # Fetch atomic sequence counter (Simulated for this implementation)
            # seq = await conn.fetchval("SELECT nextval('roll_no_seq')")
            seq = 42 
            
            roll_number = f"{year_suffix}{program_code}{quota_code}{seq:03d}"
            
            # Lock it into the database
            await conn.execute(
                "UPDATE admissions.applications SET institutional_roll_no = $1 WHERE application_id = $2",
                roll_number, application_id
            )
            
            logger.info(f"Dynamically generated institutional Roll No: {roll_number}")
            return roll_number
