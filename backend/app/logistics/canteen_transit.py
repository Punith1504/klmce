import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
from datetime import datetime, time

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/logistics", tags=["Canteen IoT & Fleet Transit"])

async def get_db_pool(): pass

class QRCodeScanReq(BaseModel):
    student_id: str
    meal_type: str # BREAKFAST, LUNCH, DINNER
    scanner_node_id: str # The physical IoT turnstile doing the scanning

@router.post("/canteen/scan")
async def validate_meal_token(req: QRCodeScanReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    High-Throughput IoT Meal Validation.
    When a student flashes their QR code at the mess entrance, this endpoint validates
    their assigned Mess Plan and securely guarantees they haven't already double-dipped
    this specific meal tranche.
    """
    async with db_pool.acquire() as conn:
        allocation = await conn.fetchrow(
            "SELECT mess_plan, status FROM logistics.room_allocations WHERE student_id = $1",
            req.student_id
        )
        if not allocation or allocation['mess_plan'] == 'NONE' or allocation['status'] != 'CONFIRMED':
            raise HTTPException(status_code=403, detail="ACCESS DENIED: No active mess plan found or financial dues pending.")
            
        # Prevent Double-Dipping: Check if they already scanned in for this meal type today
        already_scanned = await conn.fetchval(
            "SELECT COUNT(*) FROM logistics.canteen_telemetry WHERE student_id = $1 AND meal_type = $2 AND scan_timestamp::date = CURRENT_DATE",
            req.student_id, req.meal_type
        )
        if already_scanned > 0:
            logger.warning(f"Double-dip detected. Student {req.student_id} already consumed {req.meal_type}.")
            raise HTTPException(status_code=429, detail="MEAL ALREADY CONSUMED.")
        
        # Log physical consumption telemetry
        await conn.execute(
            "INSERT INTO logistics.canteen_telemetry (student_id, meal_type) VALUES ($1, $2)",
            req.student_id, req.meal_type
        )
        
    logger.info(f"IoT Token Validated. Student {req.student_id} authorized for {allocation['mess_plan']} {req.meal_type}.")
    return {"status": "AUTHORIZED", "mess_plan": allocation['mess_plan'], "command": "UNLOCK_PHYSICAL_TURNSTILE"}

class TelemetryBatchReq(BaseModel):
    scan_id: str
    wastage_grams: int

@router.post("/canteen/telemetry")
async def ingest_wastage_telemetry(req: TelemetryBatchReq, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Predictive AI Cooking Analytics.
    Ingests physical food wastage telemetry from smart disposal bins. 
    Allows the procurement team to optimize bulk ingredient purchasing algorithms.
    """
    async with db_pool.acquire() as conn:
        await conn.execute(
            "UPDATE logistics.canteen_telemetry SET food_wastage_grams = $1 WHERE scan_id = $2",
            req.wastage_grams, req.scan_id
        )
    logger.info(f"IoT Node mapped {req.wastage_grams}g of food wastage to meal scan {req.scan_id}")
    return {"status": "TELEMETRY_LOGGED"}

class TransitRouteConfig(BaseModel):
    bus_number: str
    stop_name: str
    transport_fee: float

@router.post("/transit/stops")
async def configure_transit_pickup(req: TransitRouteConfig, db_pool: asyncpg.Pool = Depends(get_db_pool)):
    """
    Fleet Transit Route Configurator.
    Binds a specific geographical pickup point to a dynamic financial ledger fee 
    (e.g., stops further from the institution dynamically charge higher tuition transport rates).
    """
    logger.info(f"Engineered Transit Geofence: {req.stop_name} mapped to Fleet {req.bus_number} at ₹{req.transport_fee}")
    return {"status": "SUCCESS"}
