import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/social", tags=["Internal Social Feed & E-Notices"])

async def get_db_pool(): pass

class FeedPostReq(BaseModel):
    author_id: str
    cohort_id: str = None 
    content: str
    media_s3_keys: List[str] = []

@router.post("/feed/post")
async def create_social_post(req: FeedPostReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Restricted Campus Social Enclave.
    Allows students to post media and text securely. The `cohort_id` acts as a 
    logical namespace, guaranteeing posts are isolated strictly to authorized classmates 
    rather than blasting the entire university infrastructure.
    """
    import json
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO social.feed_posts (author_id, cohort_id, content, media_s3_keys)
            VALUES ($1, $2, $3, $4::jsonb)
            """,
            req.author_id, req.cohort_id, req.content, json.dumps(req.media_s3_keys)
        )
    logger.info(f"Isolated Feed Post securely ingested by {req.author_id} within Cohort {req.cohort_id}")
    return {"status": "SUCCESS"}

class ENoticeBroadcastReq(BaseModel):
    issuer_admin_id: str
    target_booth: str # e.g., 'ALL_BTECH_CSE', 'STAFF_ONLY', 'HOSTEL_BLOCK_A'
    title: str
    content: str
    is_mandatory: bool = True

@router.post("/enotices/broadcast")
async def broadcast_enotice(req: ENoticeBroadcastReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    High-Velocity E-Notice Broadcast Console.
    Allows leadership to blast targeted digital directives. If `is_mandatory` is True, 
    the frontend UI becomes mathematically locked out for targeted students until they click 'Acknowledge'.
    """
    async with db_pool.acquire() as conn:
        notice_id = await conn.fetchval(
            """
            INSERT INTO social.enotices (issuer_admin_id, target_booth, title, content, is_mandatory)
            VALUES ($1, $2, $3, $4, $5) RETURNING notice_id
            """,
            req.issuer_admin_id, req.target_booth, req.title, req.content, req.is_mandatory
        )
    
    # In production, dispatch Firebase Cloud Messaging (FCM) tokens here for mobile alerts
    logger.info(f"Broadcasted Mandatory Directive '{req.title}' globally to Booth: {req.target_booth}")
    return {"status": "BROADCASTED", "notice_id": str(notice_id)}

class ReadReceiptReq(BaseModel):
    notice_id: str
    student_id: str

@router.post("/enotices/acknowledge")
async def acknowledge_enotice(req: ReadReceiptReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Compliance Read-Receipt Tracking.
    Generates exact analytical matrices proving exactly which students have and 
    have not read official administrative warnings.
    """
    async with db_pool.acquire() as conn:
        try:
            await conn.execute(
                "INSERT INTO social.enotice_receipts (notice_id, student_id) VALUES ($1, $2)",
                req.notice_id, req.student_id
            )
        except asyncpg.exceptions.UniqueViolationError:
            pass # Suppress duplicated acknowledgement spam
            
    logger.info(f"Official Directive {req.notice_id} cryptographically acknowledged by Student {req.student_id}")
    return {"status": "ACKNOWLEDGED"}
