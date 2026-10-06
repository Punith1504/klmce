from fastapi import APIRouter, Depends
from pydantic import BaseModel
import asyncpg

from app.core.database import get_db_connection
from app.core.dependencies import require_roles, Role
from app.core.security import RFC7807Exception

router = APIRouter()

class RolloverRequest(BaseModel):
    current_academic_year: str
    next_academic_year: str

@router.post("/trigger-rollover")
async def execute_eoy_rollover(
    req: RolloverRequest,
    # STRICT ENFORCEMENT: Only Super Admins can physically trigger a platform rollover
    token: dict = Depends(require_roles(Role.SUPER_ADMIN)), 
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    from fastapi import HTTPException
    raise HTTPException(503, "This integration is disabled until its security and persistence checks are complete")
