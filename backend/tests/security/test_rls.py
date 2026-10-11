import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_tenant_isolation_students(client: AsyncClient, seed_users, seeded_tenants, sys_db_conn):
    """
    RISK COVERED: Leaking student records across tenants.
    EXPECTED BEHAVIOR: College B Admin cannot see College A's students.
    """
    # 1. Insert a student into College A
    tenant_a_id = seeded_tenants["A"]
    parent_a_id = seed_users["A_PARENT"]
    student_a_id = await sys_db_conn.fetchval(
        "INSERT INTO students (tenant_id, parent_id, first_name, last_name, enrollment_number) VALUES ($1, $2, $3, $4, $5) RETURNING student_id",
        tenant_a_id, parent_a_id, "Alice", "Smith", "A-101"
    )

    # 2. Login as College B Admin (bypassed because of RLS bug, manually generating token)
    from app.core.security import create_access_token
    token_data = {
        "sub": str(seed_users["B_ADMIN"]),
        "tenant_id": str(seeded_tenants["B"]),
        "role": "ADMIN"
    }
    b_admin_token = create_access_token(token_data)
    
    # 3. Request students using College B Admin token
    # We must set the cookie manually
    client.cookies.set("access_token", b_admin_token)
    
    response = await client.get("/api/v1/students")
    assert response.status_code == 200, response.text
    
    students = response.json()
    # Ensure Alice from College A is NOT in the response
    student_ids = [s["student_id"] for s in students]
    assert str(student_a_id) not in student_ids, "CRITICAL VULNERABILITY: RLS Tenant Leak detected!"

@pytest.mark.asyncio
async def test_parent_student_isolation(client: AsyncClient, seed_users, seeded_tenants, sys_db_conn):
    """
    RISK COVERED: Parents querying other parents' students.
    EXPECTED BEHAVIOR: A parent can only see their own children.
    """
    tenant_a_id = seeded_tenants["A"]
    parent_a_id = seed_users["A_PARENT"]
    other_parent_id = seed_users["B_PARENT"] # Let's say we have another parent in A
    
    student_a_id = await sys_db_conn.fetchval(
        "INSERT INTO students (tenant_id, parent_id, first_name, last_name, enrollment_number) VALUES ($1, $2, $3, $4, $5) RETURNING student_id",
        tenant_a_id, parent_a_id, "Alice", "Smith", "A-102"
    )
    
    from app.core.security import create_access_token
    
    # Generate token for another parent (Let's reuse B_PARENT but pretend they are in tenant A to test parent_id isolation)
    # Wait, if they are in Tenant B, tenant isolation blocks it. We need two parents in Tenant A!
    # Let's insert a second parent in Tenant A
    from app.core.security import get_password_hash
    pwd_hash = get_password_hash("TestPassword123!")
    parent_a2_id = await sys_db_conn.fetchval(
        "INSERT INTO users (tenant_id, role, first_name, last_name, email, password_hash, login_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id",
        tenant_a_id, "PARENT", "Other", "Parent", "other_parent@collegea.edu", pwd_hash, "A_PARENT2_LOGIN"
    )
    
    token_data = {
        "sub": str(parent_a2_id),
        "tenant_id": str(tenant_a_id),
        "role": "PARENT"
    }
    parent2_token = create_access_token(token_data)
    client.cookies.set("access_token", parent2_token)
    
    response = await client.get("/api/v1/students")
    assert response.status_code == 200, response.text
    
    students = response.json()
    student_ids = [s["student_id"] for s in students]
    assert str(student_a_id) not in student_ids, "CRITICAL VULNERABILITY: RLS Parent Leak detected!"
