from enum import Enum
from uuid import UUID
from fastapi import Depends, Request, HTTPException
from .security import decode_token, RFC7807Exception

class Role(str, Enum):
    SUPER_ADMIN="SUPER_ADMIN"
    INSTITUTION_ADMIN="INSTITUTION_ADMIN"
    FACULTY="FACULTY"
    STUDENT="STUDENT"
    PARENT="PARENT"
    FINANCE="FINANCE"
    HR="HR"

def get_current_user_token(request: Request):
    token = request.cookies.get("access_token")
    if not token: raise HTTPException(401,"Access token missing")
    return decode_token(token,"access")

async def get_active_user(request: Request):
    # Bearer credentials are accepted only from the configured Clerk issuer.
    from .database import get_db_pool
    authorization = request.headers.get("authorization", "")
    if authorization.startswith("Bearer "):
        from .identity import verify_clerk_token
        claims = await verify_clerk_token(authorization[7:])
        lookup, value = "external_subject", claims["sub"]
    else:
        claims = get_current_user_token(request)
        lookup, value = "user_id", UUID(claims["sub"])
        from .redis import get_redis_client
        redis = await get_redis_client()
        if not claims.get("sid") or await redis.get("session:"+claims["sid"]) != claims["sub"]: raise HTTPException(401,"Session revoked")
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # SECURITY DEFINER lookup exposes only active principal metadata, not arbitrary rows.
        row = await conn.fetchrow("SELECT * FROM erp_identity($1, $2)", lookup, str(value))
    if not row or not row["is_active"]: raise HTTPException(401,"Account unavailable")
    if lookup == "user_id" and (str(row["tenant_id"]) != claims["tenant_id"] or row["role"] != claims["role"]):
        raise HTTPException(401,"Account permissions changed; sign in again")
    if lookup == "external_subject" and row["role"] in ("SUPER_ADMIN","INSTITUTION_ADMIN","FACULTY","FINANCE","HR"):
        # Clerk v2 session claims: second factor age is -1 when never verified.
        age = claims.get("fva")
        if not isinstance(age,list) or len(age)!=2 or not isinstance(age[1],(int,float)) or not 0 <= age[1] <= 15:
            raise HTTPException(403,"Recent second-factor verification required")
    return {"sub":str(row["user_id"]),"tenant_id":str(row["tenant_id"]),"role":row["role"]}

def require_roles(*roles):
    def guard(token_payload: dict = Depends(get_active_user)):
        if token_payload.get("role") not in [r.value for r in roles]:
            raise HTTPException(403,"Role not permitted")
        return token_payload
    return guard

async def get_db_pool():
    from .database import get_db_pool as get_pool
    return await get_pool()

async def get_db_connection(token_payload: dict = Depends(get_active_user)):
    from .database import get_db_connection as connection
    async for conn in connection(token_payload): yield conn

async def verify_parent_student_link(student_id: UUID, token_payload: dict=Depends(get_active_user), conn=Depends(get_db_connection)):
    if token_payload["role"] == "PARENT" and not await conn.fetchval(
        "SELECT 1 FROM students WHERE student_id=$1 AND parent_id=$2 AND tenant_id=$3",
        student_id,UUID(token_payload["sub"]),UUID(token_payload["tenant_id"])):
        raise HTTPException(403,"Student not linked to this parent")
    return True
