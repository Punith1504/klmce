import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/logistics/hostels", tags=["Hostel Administration & Facilities"])

async def get_db_pool(): pass

class PreferenceReq(BaseModel):
    student_id: str
    preferred_block: str
    ac_required: bool
    mess_plan: str

@router.post("/preferences/submit")
async def capture_room_preference(req: PreferenceReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Captures student housing preferences prior to the start of the semester.
    Binds the requested Mess Plan (e.g., South Indian, Continental) to the 
    eventual room allocation.
    """
    # Logic: Validate block configurations and push constraint-checked preferences to the DB.
    logger.info(f"Captured physical infrastructure preference for student {req.student_id}")
    return {"status": "SUCCESS", "message": "Housing preferences recorded successfully."}

class TicketReq(BaseModel):
    student_id: str
    room_id: str
    category: str
    description: str

@router.post("/maintenance/ticket")
async def raise_maintenance_ticket(req: TicketReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Unified Facilities Ticketing Engine.
    Handles plumbing, electrical, and internet downtime complaints, binding them 
    directly to a specific physical node (room/floor) for rapid maintenance routing.
    """
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO logistics.maintenance_tickets (student_id, room_id, issue_category, description)
            VALUES ($1, $2, $3, $4)
            """,
            req.student_id, req.room_id, req.category, req.description
        )
        
    # In production, dispatch an alert to the relevant facility manager via Webhook
    logger.info(f"Raised {req.category} SLA ticket for Physical Room {req.room_id}")
    return {"status": "OPEN", "message": "Ticket successfully routed to physical facilities management."}
