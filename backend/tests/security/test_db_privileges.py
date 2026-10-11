import pytest
import asyncpg
import os

@pytest.mark.asyncio
async def test_app_role_cannot_delete_or_truncate():
    """
    EXPECTED BEHAVIOR: app_user cannot run DELETE, UPDATE, or TRUNCATE on protected tables.
    """
    db_url = os.environ.get("DB_URL", "postgresql://app_user:app_user_pass@localhost:5432/klmce_erp")
    
    # We will try to connect. If it fails due to DB offline, we will skip or xfail so it doesn't hard-crash if the test is run in a mocked env.
    try:
        conn = await asyncpg.connect(db_url)
    except Exception as e:
        pytest.skip(f"Database not available for role test: {e}")
        return

    protected_tables = [
        "audit_logs",
        "exam_marks",
        "fee_transactions",
        "attendance_records",
        "students",
        "timetable_slots"
    ]

    try:
        for table in protected_tables:
            with pytest.raises(asyncpg.exceptions.InsufficientPrivilegeError):
                await conn.execute(f"DELETE FROM {table}")
            with pytest.raises(asyncpg.exceptions.InsufficientPrivilegeError):
                await conn.execute(f"TRUNCATE {table}")
            with pytest.raises(asyncpg.exceptions.InsufficientPrivilegeError):
                await conn.execute(f"UPDATE {table} SET tenant_id = tenant_id")
    finally:
        await conn.close()
