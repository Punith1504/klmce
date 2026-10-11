import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_marks_lock_date(client: AsyncClient, seed_users):
    """
    EXPECTED BEHAVIOR: Modifying marks after the lock date is rejected.
    """
    pass

@pytest.mark.asyncio
async def test_fee_attendance_locks(db_conn):
    """
    EXPECTED BEHAVIOR: Fee and attendance records are read-only after academic year freeze.
    """
    pass
