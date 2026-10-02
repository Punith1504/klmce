import json
import logging
import asyncio
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

try:
    from redis import asyncio as aioredis
except ImportError:
    pass # In production, ensure redis is in requirements.txt

# Attempt to import our previously built WhatsApp engine for notifications
try:
    from app.messaging.tasks import send_whatsapp_interactive_template
except ImportError:
    send_whatsapp_interactive_template = None

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/transport", tags=["Fleet Telemetry & IoT"])

# Connect to Redis for high-throughput geospatial indexing
# Use aioredis for asynchronous, non-blocking I/O operations
try:
    redis_client = aioredis.from_url("redis://localhost:6379", decode_responses=True)
except NameError:
    redis_client = None

# Mock Database of Student Pickup Stops
# In a real environment, this is loaded from PostgreSQL at startup
STUDENT_STOPS = {
    "stop_north_gate": {"lat": 12.9716, "lng": 77.5946, "parents": ["+1234567890"]},
    "stop_south_park": {"lat": 12.9600, "lng": 77.5900, "parents": ["+0987654321"]}
}

@router.websocket("/ws/telemetry/ingest")
async def ingest_fleet_telemetry(websocket: WebSocket, device_id: str):
    """
    High-Throughput IoT Ingestion Route.
    Accepts 3Hz telemetry from hardware OBD-II devices or Driver Mobile Apps.
    """
    await websocket.accept()
    logger.info(f"OBD-II Device {device_id} connected to IoT Telemetry Ingestion.")
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            bus_id = payload.get("bus_id", device_id)
            lat = float(payload.get("lat"))
            lng = float(payload.get("lng"))
            speed = float(payload.get("speed", 0.0))
            
            if redis_client:
                # 1. Update Real-Time Position in Redis Geospatial Index (O(log(N)) complexity)
                await redis_client.geoadd(name="fleet_positions", values=(lng, lat, bus_id))
                
                # Update high-velocity metadata in an O(1) Hash
                await redis_client.hset(f"bus_meta:{bus_id}", mapping={
                    "speed": speed,
                    "timestamp": payload.get("timestamp"),
                    "lat": lat,
                    "lng": lng
                })
                
                # 2. Geofencing Proximity Calculations
                # Check if the bus has breached a 1-kilometer radius of any designated student stops
                for stop_id, stop_data in STUDENT_STOPS.items():
                    nearby_buses = await redis_client.georadius(
                        name="fleet_positions", 
                        longitude=stop_data['lng'], 
                        latitude=stop_data['lat'], 
                        radius=1, # 1 km geofence
                        unit='km'
                    )
                    
                    if bus_id in nearby_buses:
                        # Distributed Lock: Prevent spamming parents via SMS
                        alert_key = f"alert_lock:{bus_id}:{stop_id}"
                        if not await redis_client.get(alert_key):
                            # Lock the alert for 30 minutes
                            await redis_client.set(alert_key, "1", ex=1800)
                            
                            logger.warning(f"🚨 GEOFENCE BREACH: Bus {bus_id} entered 1km radius of {stop_id}")
                            
                            # 3. Fire Automated Parent Push Notification / WhatsApp
                            for parent_phone in stop_data["parents"]:
                                if send_whatsapp_interactive_template:
                                    send_whatsapp_interactive_template.delay(
                                        to_phone=parent_phone,
                                        template_name="bus_arriving_alert",
                                        components=[] # e.g. Add a button "Track Live"
                                    )
                                logger.info(f"Dispatched proximity alert to Parent: {parent_phone}")
            
    except WebSocketDisconnect:
        logger.info(f"Fleet Device {device_id} disconnected.")

@router.websocket("/ws/telemetry/stream")
async def stream_fleet_positions(websocket: WebSocket, route_id: str):
    """
    Client-facing WebSocket for the Next.js Parent Map Dashboard.
    Streams 1Hz updates utilizing the Redis Geospatial cache to prevent hitting the primary DB.
    """
    await websocket.accept()
    try:
        while True:
            if redis_client:
                # Fetch absolute latest position from the Redis In-Memory Cache
                meta = await redis_client.hgetall(f"bus_meta:{route_id}")
                if meta:
                    await websocket.send_json({
                        "bus_id": route_id,
                        "lat": float(meta.get("lat", 0)),
                        "lng": float(meta.get("lng", 0)),
                        "speed": float(meta.get("speed", 0))
                    })
            # Throttled at 1Hz to conserve parent mobile battery and bandwidth
            await asyncio.sleep(1) 
    except WebSocketDisconnect:
        pass
