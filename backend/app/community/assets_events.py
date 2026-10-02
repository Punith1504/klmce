import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/community", tags=["Events & Asset Lifecycle Management"])

async def get_db_pool(): pass

class EventRegistrationReq(BaseModel):
    event_id: str
    attendee_id: str

@router.post("/events/register")
async def register_for_event(req: EventRegistrationReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    High-Concurrency Event Registration Engine.
    Protects physical venue limits from being breached during massive traffic spikes (e.g., Tech Fest registration).
    Uses pessimistic `FOR UPDATE NOWAIT` locking to strictly cap digital ticket issuance against physical seat counts.
    """
    async with db_pool.acquire() as conn:
        try:
            async with conn.transaction():
                event = await conn.fetchrow(
                    "SELECT seat_capacity FROM community.events WHERE event_id = $1 FOR UPDATE NOWAIT",
                    req.event_id
                )
                if not event:
                    raise HTTPException(status_code=404, detail="Event configuration not found.")
                    
                current_registrations = await conn.fetchval(
                    "SELECT COUNT(*) FROM community.event_registrations WHERE event_id = $1",
                    req.event_id
                )
                
                # Enforce physical limitations mathematically
                if current_registrations >= event['seat_capacity']:
                    raise HTTPException(status_code=400, detail="Event is entirely sold out. Seat capacity breached.")
                    
                await conn.execute(
                    "INSERT INTO community.event_registrations (event_id, attendee_id) VALUES ($1, $2)",
                    req.event_id, req.attendee_id
                )
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=400, detail="Duplicate Request: Attendee already registered.")
        except asyncpg.exceptions.LockNotAvailableError:
            logger.warning(f"Lock contention during heavy event registration traffic on Event {req.event_id}")
            raise HTTPException(status_code=503, detail="Server busy parsing registrations. Please retry.")
            
    logger.info(f"Attendee {req.attendee_id} successfully secured a digital ticket for Event {req.event_id}")
    return {"status": "SUCCESS", "message": "Digital Ticket Issued."}

class AssetLifecycleUpdate(BaseModel):
    asset_tag: str
    new_status: str # 'MAINTENANCE', 'RETIRED'
    service_notes: str

@router.post("/assets/service")
async def update_asset_lifecycle(req: AssetLifecycleUpdate, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    IT & Lab Infrastructure Lifecycle Manager.
    Allows departments to track physical hardware by barcode (`asset_tag`), shifting states between
    active deployment, maintenance, and end-of-life retirement. Critical for insurance audits.
    """
    async with db_pool.acquire() as conn:
        updated = await conn.execute(
            "UPDATE community.assets SET status = $1 WHERE asset_tag = $2",
            req.new_status, req.asset_tag
        )
        if updated == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Critical Error: Physical Asset Tag not found in institutional ledger.")
            
        # In production, append to a strictly append-only `asset_audit_logs` table here.
        
    logger.info(f"Institutional Asset {req.asset_tag} transitioned to {req.new_status}. Notes: {req.service_notes}")
    return {"status": "SUCCESS", "message": "Hardware ledger updated successfully."}
