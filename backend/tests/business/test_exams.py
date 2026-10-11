import pytest
from httpx import AsyncClient
import uuid

pytestmark = pytest.mark.asyncio

async def test_update_exam_mark_missing_dependency_FAILS_DUE_TO_RLS_BUG(client: AsyncClient, sys_db_conn, seed_users, seeded_tenants, auth_tokens):
    """
    RISK COVERED: Updating an exam mark.
    EXPECTED BEHAVIOR: Endpoint should work.
    CURRENT BEHAVIOR: Endpoint should crash with NotImplementedError because get_db_session is not provided.
    """
    tenant_a_id = seeded_tenants["A"]
    faculty_a_id = seed_users["A_FACULTY"]
    
    # 1. Insert an exam mark using raw asyncpg
    student_id = await sys_db_conn.fetchval(
        """
        INSERT INTO students (tenant_id, first_name, last_name, enrollment_number)
        VALUES ($1, 'John', 'Doe', 'E123')
        RETURNING student_id;
        """,
        tenant_a_id
    )
    mark_id = await sys_db_conn.fetchval(
        """
        INSERT INTO exam_marks (tenant_id, student_id, subject, marks_obtained, max_marks, exam_date)
        VALUES ($1, $2, 'Math', 50.00, 100.00, '2026-05-01')
        RETURNING mark_id;
        """,
        tenant_a_id, student_id
    )

    # 2. Get faculty token
    token = auth_tokens["A_FACULTY"]
    
    # 3. Try to update the mark
    response = await client.put(
        f"/api/v1/exams/marks/{mark_id}",
        cookies={"access_token": token},
        json={"marks_obtained": 75.00}
    )
    
    # It will fail with 500 internal server error due to NotImplementedError
    assert response.status_code == 500
