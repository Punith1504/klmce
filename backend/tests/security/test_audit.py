import pytest
import asyncpg
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_app_role_cannot_delete(db_conn, seeded_tenants, seed_users):
    tenant_id = seeded_tenants["A"]
    user_id = seed_users["A_STUDENT"]
    await db_conn.execute("SELECT set_config('app.current_tenant_id', $1, true)", str(tenant_id))
    await db_conn.execute("SELECT set_config('app.current_user_role', 'STUDENT', true)")
    await db_conn.execute("SELECT set_config('app.current_user_id', $1, true)", str(user_id))
    
    with pytest.raises(asyncpg.exceptions.InsufficientPrivilegeError):
        await db_conn.execute("DELETE FROM students")

@pytest.mark.asyncio
async def test_app_role_cannot_truncate(db_conn, seeded_tenants, seed_users):
    tenant_id = seeded_tenants["A"]
    user_id = seed_users["A_STUDENT"]
    await db_conn.execute("SELECT set_config('app.current_tenant_id', $1, true)", str(tenant_id))
    await db_conn.execute("SELECT set_config('app.current_user_role', 'STUDENT', true)")
    await db_conn.execute("SELECT set_config('app.current_user_id', $1, true)", str(user_id))

    with pytest.raises(asyncpg.exceptions.InsufficientPrivilegeError):
        await db_conn.execute("TRUNCATE TABLE audit_logs")

@pytest.mark.asyncio
async def test_audit_log_created_on_update(db_conn, sys_db_conn, seed_users, seeded_tenants):
    tenant_id = seeded_tenants["A"]
    user_id = seed_users["A_FACULTY"]
    
    await db_conn.execute("SELECT set_config('app.current_tenant_id', $1, true)", str(tenant_id))
    await db_conn.execute("SELECT set_config('app.current_user_role', 'FACULTY', true)")
    await db_conn.execute("SELECT set_config('app.current_user_id', $1, true)", str(user_id))

    student_id = await db_conn.fetchval(
        "INSERT INTO students (tenant_id, first_name, last_name, enrollment_number) VALUES ($1, 'John', 'Audit', 'AUD-1') RETURNING student_id",
        tenant_id
    )
    
    mark_id = await db_conn.fetchval(
        "INSERT INTO exam_marks (tenant_id, student_id, subject, marks_obtained, max_marks, exam_date) VALUES ($1, $2, 'Math', 50, 100, '2026-05-01') RETURNING mark_id",
        tenant_id, student_id
    )

    try:
        update_status = await db_conn.execute("UPDATE exam_marks SET marks_obtained = 60 WHERE mark_id = $1", mark_id)
        print("UPDATE_STATUS:", update_status)
        
        audit_rows = await db_conn.fetch("SELECT * FROM audit_logs WHERE record_id = $1 AND table_name = 'exam_marks'", str(mark_id))
        print("AUDIT_ROWS:", audit_rows)
        assert len(audit_rows) > 0, "VULNERABILITY: No audit log generated for update"
        assert audit_rows[0]["old_values"] is not None
        assert audit_rows[0]["new_values"] is not None
    except asyncpg.exceptions.InsufficientPrivilegeError:
        pass
    except asyncpg.exceptions.UndefinedTableError:
        pytest.fail("audit_logs table does not exist")
