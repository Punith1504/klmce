import os
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4
import bcrypt
import pyotp
import jwt
from jwt import PyJWTError as JWTError
from fastapi import HTTPException
from fastapi.responses import JSONResponse

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"
ISSUER = "klmce-erp"
AUDIENCE = "klmce-api"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
ROLES = {"SUPER_ADMIN", "INSTITUTION_ADMIN", "FACULTY", "STUDENT", "PARENT", "FINANCE", "HR"}

def validate_secret(value: str, name: str) -> str:
    if len(value.encode()) < 32 or any(word in value.lower() for word in ("replace", "placeholder", "super-secret", "default_insecure")):
        raise RuntimeError(f"{name} must be an independently generated secret of at least 32 bytes")
    return value

class RFC7807Exception(HTTPException):
    def __init__(self, status_code, type, title, detail, instance=None, headers=None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.type, self.title, self.instance = type, title, instance

def rfc7807_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"type":exc.type,
        "title":exc.title,"status":exc.status_code,"detail":exc.detail},
        headers={"Content-Type":"application/problem+json", **(exc.headers or {})})

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    except (ValueError, TypeError):
        return False

def get_password_hash(password):
    if not 12 <= len(password.encode()) <= 72:
        raise ValueError("Password must contain between 12 and 72 UTF-8 bytes")
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()

def _token(data, purpose, delta):
    now = datetime.now(timezone.utc)
    return jwt.encode({**data, "exp":now+delta, "iat":now, "iss":ISSUER,
        "aud":AUDIENCE, "type":purpose, "jti":str(uuid4())},
        validate_secret(SECRET_KEY,"SECRET_KEY"), algorithm=ALGORITHM)

def create_access_token(data):
    return _token(data,"access",timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

def create_refresh_token(data):
    return _token(data,"refresh",timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

def decode_token(token, purpose):
    try:
        payload = jwt.decode(token, validate_secret(SECRET_KEY,"SECRET_KEY"),
            algorithms=[ALGORITHM], issuer=ISSUER, audience=AUDIENCE,
            options={"require":["exp","iat","sub","jti","iss","aud"]})
        UUID(payload["sub"]); UUID(payload["tenant_id"])
        if payload["type"] != purpose or payload["role"] not in ROLES:
            raise ValueError("Invalid purpose or role")
        return payload
    except (JWTError, ValueError, KeyError, TypeError):
        raise HTTPException(401, "Invalid or expired credentials") from None

def generate_totp_secret(): return pyotp.random_base32()
def verify_totp(secret, code):
    try: return pyotp.TOTP(secret).verify(code, valid_window=0)
    except (ValueError, TypeError): return False
