from fastapi import APIRouter, Depends, Response, Request
from .security import (
    verify_password, create_access_token, create_refresh_token, verify_totp, 
    RFC7807Exception, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
)
from pydantic import BaseModel
from jose import JWTError, jwt
import asyncpg
from typing import Optional

router = APIRouter(prefix="/auth", tags=["authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str
    totp_code: Optional[str] = None

class OAuth2CallbackRequest(BaseModel):
    provider: str  
    code: str

async def get_db_pool() -> asyncpg.Pool:
    raise NotImplementedError()

# Mandatory TOTP Roles
TOTP_MANDATORY_ROLES = ["SUPER_ADMIN", "INSTITUTION_ADMIN", "FACULTY", "FINANCE"]

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/api", # Scoped to API routes
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/api/auth/refresh", # Strictly scoped to refresh endpoint
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

@router.post("/login")
async def login(
    login_data: LoginRequest,
    response: Response,
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT user_id, tenant_id, role, password_hash, mfa_secret FROM users WHERE email = $1", 
            login_data.email
        )
        
        if not user or not verify_password(login_data.password, user["password_hash"]):
            raise RFC7807Exception(
                status_code=401,
                type="https://api.erp.internal/probs/auth-failed",
                title="Authentication Failed",
                detail="Invalid credentials."
            )
            
        role = user["role"]
        
        # 1. Enforce TOTP for sensitive roles
        if role in TOTP_MANDATORY_ROLES:
            if not login_data.totp_code:
                raise RFC7807Exception(
                    status_code=401,
                    type="https://api.erp.internal/probs/mfa-required",
                    title="MFA Required",
                    detail="A TOTP code is required to authenticate for your role."
                )
            if not user["mfa_secret"] or not verify_totp(user["mfa_secret"], login_data.totp_code):
                raise RFC7807Exception(
                    status_code=401,
                    type="https://api.erp.internal/probs/invalid-totp",
                    title="Invalid MFA Code",
                    detail="The TOTP code provided is incorrect or expired."
                )

        # 2. Generate Tokens
        token_data = {
            "sub": str(user["user_id"]),
            "tenant_id": str(user["tenant_id"]),
            "role": role
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # 3. Transmit strictly via HTTP-Only cookies
        set_auth_cookies(response, access_token, refresh_token)
        
        return {"message": "Login successful"}

@router.post("/oauth2/callback")
async def oauth2_callback(
    callback_data: OAuth2CallbackRequest,
    response: Response,
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    # Implementation details for OAuth2 SSO
    # Must enforce TOTP or rely on IdP configurations for strict roles.
    pass

@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response
):
    token = request.cookies.get("refresh_token")
    if not token:
        raise RFC7807Exception(
            status_code=401,
            type="https://api.erp.internal/probs/unauthorized",
            title="Unauthorized",
            detail="Refresh token is missing"
        )
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise ValueError()
            
        # Sliding Expiration: Issue new set of tokens
        token_data = {
            "sub": payload.get("sub"),
            "tenant_id": payload.get("tenant_id"),
            "role": payload.get("role")
        }
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        set_auth_cookies(response, new_access_token, new_refresh_token)
        
        return {"message": "Tokens refreshed successfully"}
    except JWTError:
        raise RFC7807Exception(
            status_code=401,
            type="https://api.erp.internal/probs/invalid-refresh",
            title="Invalid Token",
            detail="The refresh token provided is invalid or expired."
        )

@router.post("/logout")
async def logout(response: Response):
    # Invalidate session explicitly via cookies
    response.delete_cookie("access_token", path="/api")
    response.delete_cookie("refresh_token", path="/api/auth/refresh")
    return {"message": "Logout successful"}
