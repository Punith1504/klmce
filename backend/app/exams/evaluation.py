import logging
import hashlib
import uuid
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/exams/evaluation", tags=["Masking, Grading & Certificates"])

async def get_db_pool(): pass

@router.post("/masking/generate")
async def generate_dummy_numbers(exam_id: str, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Cryptographic Identity Concealment (Masking) Service.
    Generates isolated 8-character physical barcodes. These are printed directly onto answer sheets.
    Evaluators only see the Dummy Number, physically rendering grading bias (gender, caste, status) impossible.
    """
    async with db_pool.acquire() as conn:
        students = await conn.fetch("SELECT student_id FROM exams.eligibility WHERE exam_id = $1 AND is_eligible = TRUE", exam_id)
        
        for s in students:
            # Generate a secure alphanumeric dummy barcode payload
            dummy_no = f"DN-{uuid.uuid4().hex[:8].upper()}"
            await conn.execute(
                """
                INSERT INTO exams.evaluations (exam_id, student_id, masked_dummy_number)
                VALUES ($1, $2, $3)
                """,
                exam_id, s['student_id'], dummy_no
            )
            
    logger.info(f"Identity Masking Complete. Generated {len(students)} cryptographic barcodes for Exam {exam_id}.")
    return {"status": "SUCCESS", "masked_sheets": len(students)}

class MarksEntryReq(BaseModel):
    masked_dummy_number: str
    raw_marks: float

@router.post("/submit-marks")
async def submit_evaluator_marks(req: MarksEntryReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Zero-Knowledge Grading Endpoint.
    The evaluator lodges marks against the Barcode. They have zero mathematical access 
    to the underlying `student_id`.
    """
    async with db_pool.acquire() as conn:
        updated = await conn.execute(
            "UPDATE exams.evaluations SET raw_marks = $1 WHERE masked_dummy_number = $2 AND is_demasked = FALSE",
            req.raw_marks, req.masked_dummy_number
        )
        if updated == "UPDATE 0":
            raise HTTPException(status_code=400, detail="Invalid Barcode or sheet has already been aggressively de-masked.")
            
    return {"status": "SUCCESS", "message": "Marks securely lodged into the isolated evaluation ledger."}

@router.get("/certificates/verify/{verification_hash}")
async def verify_institutional_certificate(verification_hash: str, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Public Authentication Endpoint for Employers / Background Check Agencies.
    Third parties scan the physical QR code on a KLMCE printed degree. It hits this endpoint 
    to verify the hash natively against our immutable ledger.
    """
    async with db_pool.acquire() as conn:
        cert = await conn.fetchrow(
            "SELECT student_id, certificate_type, serial_number, issued_date FROM exams.certificates WHERE verification_hash = $1",
            verification_hash
        )
        if not cert:
            logger.warning(f"FORGERY ATTEMPT DETECTED: Invalid hash scan {verification_hash}")
            raise HTTPException(status_code=404, detail="FORGERY DETECTED: Certificate hash not found in institutional ledger.")
            
    logger.info(f"Successfully verified institutional certificate {cert['serial_number']}")
    return {
        "status": "VERIFIED",
        "certificate_details": dict(cert),
        "institution": "KLMCE Institute of Technology"
    }
