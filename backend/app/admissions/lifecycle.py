import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admissions/lifecycle", tags=["Admissions Lifecycle & State Machine"])

async def get_db_pool(): pass

class UnlockFieldsReq(BaseModel):
    application_id: str
    fields_to_unlock: List[str]
    reason: str

@router.post("/applications/unlock-fields")
async def unlock_application_fields(req: UnlockFieldsReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Administrative Review Console logic.
    Instead of rejecting an entire application for a typo, admins can selectively unlock 
    specific JSON keys (e.g., 'parent_phone', 'dob') for the applicant to correct and resubmit.
    """
    unlocked_json = json.dumps(req.fields_to_unlock)
    
    async with db_pool.acquire() as conn:
        await conn.execute(
            "UPDATE admissions.applications SET unlocked_fields = $1::jsonb, updated_at = NOW() WHERE application_id = $2",
            unlocked_json, req.application_id
        )
    logger.info(f"Unlocked fields {req.fields_to_unlock} for application {req.application_id} due to: {req.reason}")
    return {"status": "SUCCESS", "message": "Specific form fields successfully unlocked for applicant correction."}

class StateTransitionReq(BaseModel):
    application_id: str
    new_status: str

@router.post("/applications/transition")
async def transition_application_state(req: StateTransitionReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Strict Finite State Machine (FSM) enforcing the lifecycle of an application.
    Applicant -> Registered -> Provisional -> Confirmed.
    """
    valid_transitions = {
        'APPLICANT': ['REGISTERED', 'REJECTED'],
        'REGISTERED': ['PROVISIONAL', 'REJECTED', 'WITHDRAWN'],
        'PROVISIONAL': ['CONFIRMED', 'WITHDRAWN'],
        'CONFIRMED': ['WITHDRAWN']
    }
    
    async with db_pool.acquire() as conn:
        current_status = await conn.fetchval("SELECT status FROM admissions.applications WHERE application_id = $1", req.application_id)
        
        if req.new_status not in valid_transitions.get(current_status, []):
            raise HTTPException(
                status_code=400, 
                detail=f"FSM Error: Invalid state transition from {current_status} to {req.new_status}"
            )
            
        await conn.execute("UPDATE admissions.applications SET status = $1, updated_at = NOW() WHERE application_id = $2", req.new_status, req.application_id)
        
        # When an applicant pays their fees and is Confirmed, trigger the provisioning engine
        if req.new_status == 'CONFIRMED':
            try:
                from app.admissions.tasks import execute_automated_provisioning
                # Fire-and-forget Celery background task for G-Suite/Microsoft Graph integrations
                execute_automated_provisioning.apply_async((req.application_id,))
            except ImportError:
                pass
            
    logger.info(f"Application {req.application_id} transitioned to {req.new_status}")
    return {"status": "SUCCESS", "new_state": req.new_status}
