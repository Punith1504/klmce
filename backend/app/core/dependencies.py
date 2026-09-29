from fastapi import Request, Depends
from fastapi.security import APIKeyCookie
from jose import JWTError, jwt
from .security import SECRET_KEY, ALGORITHM, RFC7807Exception
from enum import Enum
import asyncpg
from typing import Callable
from uuid import UUID

class Role(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    INSTITUTION_ADMIN = "INSTITUTION_ADMIN"
    FACULTY = "FACULTY"
    STUDENT = "STUDENT"
    PARENT = "PARENT"
    FINANCE = "FINANCE"
    HR = "HR"

# Needs to be implemented / overridden by app database module
async def get_db_pool() -> asyncpg.Pool:
    raise NotImplementedError("Database pool injection not implemented")

cookie_scheme = APIKeyCookie(name="access_token", auto_error=False)

def get_current_user_token(request: Request) -> dict:
    """Extracts and validates the JWT access token purely from HttpOnly cookies."""
    token = request.cookies.get("access_token")
    if not token:
        raise RFC7807Exception(
            status_code=401,
            type="https://api.erp.internal/probs/unauthorized",
            title="Unauthorized",
            detail="Access token cookie is missing"
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise ValueError()
        return payload
    except JWTError:
        raise RFC7807Exception(
            status_code=401,
            type="https://api.erp.internal/probs/invalid-token",
            title="Invalid Token",
            detail="The access token provided is invalid or expired."
        )

async def get_db_connection(
    token_payload: dict = Depends(get_current_user_token),
    pool: asyncpg.Pool = Depends(get_db_pool)
) -> asyncpg.Connection:
    """
    Middleware Dependency:
    Acquires a database connection, starts a transaction, and sets the local session variables.
    This seamlessly integrates with our Postgres Row-Level Security.
    """
    tenant_id = token_payload.get("tenant_id")
    user_id = token_payload.get("sub")
    role = token_payload.get("role")
    
    conn = await pool.acquire()
    tr = conn.transaction()
    await tr.start()
    try:
        await conn.execute(f"SET LOCAL app.current_tenant_id = '{tenant_id}'")
        await conn.execute(f"SET LOCAL app.current_user_id = '{user_id}'")
        await conn.execute(f"SET LOCAL app.current_user_role = '{role}'")
        
        yield conn
        
        await tr.commit()
    except Exception:
        await tr.rollback()
        raise
    finally:
        await pool.release(conn)

def require_roles(*allowed_roles: Role) -> Callable:
    """RBAC Guard for endpoints."""
    def role_checker(token_payload: dict = Depends(get_current_user_token)):
        user_role = token_payload.get("role")
        if user_role not in [role.value for role in allowed_roles]:
            raise RFC7807Exception(
                status_code=403,
                type="https://api.erp.internal/probs/forbidden",
                title="Forbidden",
                detail=f"User role {user_role} is not permitted to access this resource."
            )
        return token_payload
    return role_checker

async def verify_parent_student_link(
    student_id: UUID, 
    token_payload: dict = Depends(get_current_user_token),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Guard constraint ensuring Parents can strictly query their own student's records.
    (This is an explicit check prior to running business logic, alongside RLS).
    """
    user_role = token_payload.get("role")
    user_id = token_payload.get("sub")
    tenant_id = token_payload.get("tenant_id")
    
    if user_role == Role.PARENT.value:
        result = await conn.fetchrow(
            "SELECT 1 FROM students WHERE student_id = $1 AND parent_id = $2 AND tenant_id = $3",
            student_id, user_id, tenant_id
        )
        if not result:
            raise RFC7807Exception(
                status_code=403,
                type="https://api.erp.internal/probs/parent-student-link-missing",
                title="Forbidden",
                detail="You are not authorized to view or modify this student's records."
            )
    
    return True
