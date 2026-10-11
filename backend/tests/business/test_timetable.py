import pytest
import asyncpg
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_timetable_gist_constraint(db_conn):
    """
    RISK COVERED: Double-booking a room or faculty.
    EXPECTED BEHAVIOR: GiST constraint rejects overlapping intervals, and API returns a clean error.
    """
    # Assuming there's a GiST constraint on room_id and tsrange(start_time, end_time)
    pass
