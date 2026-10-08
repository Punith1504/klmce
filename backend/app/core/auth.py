import hashlib
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, Response, Request, HTTPException
from pydantic import BaseModel, Field
from .security import (verify_password, create_access_token, create_refresh_token,
    verify_totp, decode_token, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS)
from .database import get_db_pool
from .redis import get_redis_client
from .rate_limit import RateLimiter, SCRIPT
from starlette.concurrency import run_in_threadpool
from .dependencies import get_active_user

router=APIRouter()
class LoginRequest(BaseModel):
    tenant_id: UUID
    email: str = Field(min_length=3,max_length=254)
    password: str = Field(min_length=1,max_length=72)
    totp_code: str | None = Field(default=None,pattern=r"^\d{6}$")

TOTP_MANDATORY_ROLES={"SUPER_ADMIN","INSTITUTION_ADMIN","FACULTY","FINANCE","HR"}

def set_auth_cookies(response,access_token,refresh_token):
    response.set_cookie("access_token",access_token,httponly=True,secure=True,
        samesite="strict",path="/api",max_age=ACCESS_TOKEN_EXPIRE_MINUTES*60)
    response.set_cookie("refresh_token",refresh_token,httponly=True,secure=True,
        samesite="strict",path="/api/v1/auth",max_age=REFRESH_TOKEN_EXPIRE_DAYS*86400)

async def issue_session(user,response,redis,sid=None):
    sid=sid or str(uuid4())
    data={"sub":str(user["user_id"]),"tenant_id":str(user["tenant_id"]),"role":user["role"],"sid":sid}
    access,refresh=create_access_token(data),create_refresh_token(data)
    refresh_claims=decode_token(refresh,"refresh")
    ttl=REFRESH_TOKEN_EXPIRE_DAYS*86400
    await redis.set("session:"+sid,data["sub"],ex=ttl)
    await redis.set("refresh:"+refresh_claims["jti"],sid,ex=ttl)
    set_auth_cookies(response,access,refresh)

@router.post("/login")
async def login(data:LoginRequest,response:Response,pool=Depends(get_db_pool),
                redis=Depends(get_redis_client),limit=Depends(RateLimiter(3000,60))):
    import time
    account=hashlib.sha256((str(data.tenant_id)+data.email.lower().strip()).encode()).hexdigest()
    now=int(time.time()*1000)
    if not await redis.eval(SCRIPT,1,'login-account:'+account,now-60000,now,5,60,str(uuid4())):
        raise HTTPException(429,'Too many login attempts',headers={'Retry-After':'60'})
    async with pool.acquire() as conn:
        user=await conn.fetchrow("SELECT * FROM erp_login($1,$2)",data.tenant_id,data.email.lower().strip())
    if not user or not user["is_active"] or not await run_in_threadpool(verify_password,data.password,user["password_hash"]):
        raise HTTPException(401,"Invalid credentials")
    if user["role"] in TOTP_MANDATORY_ROLES:
        if not user["mfa_secret"] or not data.totp_code or not verify_totp(user["mfa_secret"],data.totp_code):
            raise HTTPException(401,"Valid second factor required")
        fingerprint=hashlib.sha256((str(user["user_id"])+data.totp_code).encode()).hexdigest()
        if not await redis.set("totp:"+fingerprint,"1",nx=True,ex=90):
            raise HTTPException(401,"Second factor already used")
    await issue_session(user,response,redis)
    return {"message":"Login successful","role":user["role"]}

@router.get("/me")
async def me(user:dict=Depends(get_active_user)): return user

@router.post("/refresh")
async def refresh_token(request:Request,response:Response,redis=Depends(get_redis_client),pool=Depends(get_db_pool)):
    payload=decode_token(request.cookies.get("refresh_token", ""),"refresh")
    sid=payload.get("sid")
    if not sid or not await redis.get("session:"+sid): raise HTTPException(401,"Session expired")
    async with pool.acquire() as conn:
        user=await conn.fetchrow("SELECT * FROM erp_identity('user_id',$1)",payload["sub"])
    if not user or not user["is_active"] or str(user["tenant_id"])!=payload["tenant_id"] or user["role"]!=payload["role"]:
        await redis.delete("session:"+sid)
        raise HTTPException(401,"Account permissions changed")
    # Keep the same family ID so reuse of an older refresh revokes the new session too.
    data={"sub":str(user["user_id"]),"tenant_id":str(user["tenant_id"]),"role":user["role"],"sid":sid}
    access,refresh=create_access_token(data),create_refresh_token(data)
    next_jti=decode_token(refresh,'refresh')['jti']
    rotated=await redis.eval("""
        if redis.call('GET',KEYS[1]) ~= ARGV[1] or redis.call('GET',KEYS[2]) ~= ARGV[2] then
            redis.call('DEL',KEYS[1]); return 0
        end
        redis.call('DEL',KEYS[2])
        redis.call('SET',KEYS[3],ARGV[2],'EX',ARGV[3])
        redis.call('EXPIRE',KEYS[1],ARGV[3])
        return 1
        """,3,'session:'+sid,'refresh:'+payload['jti'],'refresh:'+next_jti,
        data['sub'],sid,REFRESH_TOKEN_EXPIRE_DAYS*86400)
    if not rotated: raise HTTPException(401,'Refresh token reused or revoked')
    set_auth_cookies(response,access,refresh)
    return {"message":"Session refreshed"}

@router.post("/logout")
async def logout(request:Request,response:Response,redis=Depends(get_redis_client)):
    for name,purpose in (("access_token","access"),("refresh_token","refresh")):
        try:
            payload=decode_token(request.cookies.get(name,""),purpose)
            if payload.get("sid"): await redis.delete("session:"+payload["sid"])
        except HTTPException: pass
    response.delete_cookie("access_token",path="/api")
    response.delete_cookie("refresh_token",path="/api/v1/auth")
    return {"message":"Logged out"}

@router.post("/oauth2/callback")
async def unsupported_callback():
    raise HTTPException(503,"Use the configured identity provider; legacy SSO is unavailable")
