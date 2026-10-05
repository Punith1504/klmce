from fastapi import APIRouter, Depends, Response, Request
from app.core.rate_limit import RateLimiter
from .security import (
    verify_password, create_access_token, create_refresh_token, verify_totp, 
    RFC7807Exception, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
)
from pydantic import BaseModel
from pydantic import BaseModel
from jose import JWTError, jwt
import asyncpg
from typing import Optional
import secrets
import redis.asyncio as redis
from datetime import datetime, timezone
from passlib.context import CryptContext
from app.core.redis import get_redis_client
from app.messaging.tasks import send_whatsapp_text

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["authentication"])


class LoginRequest(BaseModel):
    login_id: str
    password: str
    totp_code: Optional[str] = None


class OAuth2CallbackRequest(BaseModel):
    provider: str  
    code: str

async def get_db_pool() -> asyncpg.Pool:
    raise NotImplementedError()


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
    pool: asyncpg.Pool = Depends(get_db_pool),
    redis_client: redis.Redis = Depends(get_redis_client),
    rate_limit: None = Depends(RateLimiter(max_requests=5, window_seconds=60))
):
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT user_id, tenant_id, role, password_hash, mfa_secret, phone_number, password_updated_at FROM erp_core.users WHERE login_id = $1", 
            login_data.login_id
        )
        
        if not user or not verify_password(login_data.password, user["password_hash"]):
            raise RFC7807Exception(
                status_code=401,
                type="https://api.erp.internal/probs/auth-failed",
                title="Authentication Failed",
                detail="Invalid credentials."
            )
            
        pwd_updated = user.get("password_updated_at")
        if pwd_updated:
            days_since = (datetime.now(timezone.utc) - pwd_updated).days
            if days_since >= 90:
                raise RFC7807Exception(
                    status_code=403,
                    type="https://api.erp.internal/probs/password-expired",
                    title="Password Expired",
                    detail="Your password has expired (90 days limit). Please reset it."
                )
            
        role = user["role"]
        
        # Enforce role-based login ID rules
        login_id = login_data.login_id
        if role == "PARENT" and not login_id.isdigit():
            raise RFC7807Exception(
                status_code=401,
                type="https://api.erp.internal/probs/invalid-id-format",
                title="Invalid ID Format",
                detail="Parent IDs must contain only numbers."
            )
        
        # 1. Enforce MFA branching (SMS vs TOTP)
        SMS_ROLES = ["FACULTY", "ADMIN", "SUPER_ADMIN", "INSTITUTION_ADMIN", "MANAGEMENT", "HOD", "PRINCIPAL"]
        user_id_str = str(user["user_id"])
        
        if role in SMS_ROLES:
            # SMS OTP Flow
            if not login_data.totp_code:
                # Generate and cache SMS code
                sms_code = "".join(secrets.choice("0123456789") for _ in range(6))
                await redis_client.setex(f"sms_otp_{user_id_str}", 300, sms_code)
                
                # Dispatch the SMS/WhatsApp message via Celery Background Worker
                from app.messaging.tasks import send_whatsapp_text
                msg = f"🔐 Your KLMCE Secure Login OTP is: *{sms_code}*. This code is valid for 5 minutes. Do not share it with anyone."
                send_whatsapp_text.delay(user['phone_number'], msg)
                
                raise RFC7807Exception(
                    status_code=401,
                    type="https://api.erp.internal/probs/sms-mfa-required",
                    title="SMS OTP Required",
                    detail=f"An OTP has been sent to your registered mobile number."
                )
            else:
                stored_code = await redis_client.get(f"sms_otp_{user_id_str}")
                if not stored_code or stored_code != login_data.totp_code:
                    raise RFC7807Exception(
                        status_code=401,
                        type="https://api.erp.internal/probs/invalid-sms-otp",
                        title="Invalid SMS OTP",
                        detail="The SMS OTP provided is incorrect or expired."
                    )
                await redis_client.delete(f"sms_otp_{user_id_str}")
        else:
            # TOTP App Flow (Students, Parents, etc.)
            if not login_data.totp_code:
                raise RFC7807Exception(
                    status_code=401,
                    type="https://api.erp.internal/probs/mfa-required",
                    title="MFA Required",
                    detail="A TOTP code from your authenticator app is required."
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

class ForgotPasswordRequest(BaseModel):
    login_id: str

class ResetPasswordRequest(BaseModel):
    login_id: str
    otp: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(
    req: ForgotPasswordRequest,
    pool: asyncpg.Pool = Depends(get_db_pool),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT user_id, phone_number FROM erp_core.users WHERE login_id = $1", req.login_id)
        if not user:
            return {"message": "If the ID exists, an OTP has been sent."}
            
        reset_otp = "".join(secrets.choice("0123456789") for _ in range(6))
        await redis_client.setex(f"pwd_reset_{req.login_id}", 600, reset_otp) # valid for 10 minutes
        
        msg = f"🔑 Password Reset OTP: *{reset_otp}*. Valid for 10 minutes."
        send_whatsapp_text.delay(user['phone_number'], msg)
        
        return {"message": "If the ID exists, an OTP has been sent."}

@router.post("/reset-password")
async def reset_password(
    req: ResetPasswordRequest,
    pool: asyncpg.Pool = Depends(get_db_pool),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    stored_otp = await redis_client.get(f"pwd_reset_{req.login_id}")
    if not stored_otp or stored_otp != req.otp:
        raise RFC7807Exception(status_code=401, type="probs/invalid-reset-otp", title="Invalid OTP", detail="The OTP is incorrect or expired.")
        
    hashed_pwd = pwd_context.hash(req.new_password)
    async with pool.acquire() as conn:
        res = await conn.execute(
            "UPDATE erp_core.users SET password_hash = $1, password_updated_at = CURRENT_TIMESTAMP WHERE login_id = $2",
            hashed_pwd, req.login_id
        )
        if res == "UPDATE 0":
            raise RFC7807Exception(status_code=404, type="probs/user-not-found", title="Not Found", detail="User not found.")
            
    await redis_client.delete(f"pwd_reset_{req.login_id}")
    return {"message": "Password updated successfully."}

