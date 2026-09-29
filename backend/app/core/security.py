from datetime import datetime, timedelta, timezone
import pyotp
from jose import jwt
from passlib.context import CryptContext
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from pydantic import BaseModel

# Password hashing configuration (bcrypt with cost factor 12)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# Environment variables in production
SECRET_KEY = "super-secret-key-replace-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

class RFC7807Exception(HTTPException):
    """
    Standardized Error Response matching RFC 7807 specifications.
    """
    def __init__(self, status_code: int, type: str, title: str, detail: str, instance: str = None):
        self.status_code = status_code
        self.type = type
        self.title = title
        self.detail = detail
        self.instance = instance

def rfc7807_exception_handler(request, exc: RFC7807Exception) -> JSONResponse:
    content = {
        "type": exc.type,
        "title": exc.title,
        "status": exc.status_code,
        "detail": exc.detail
    }
    if exc.instance:
        content["instance"] = exc.instance
    return JSONResponse(
        status_code=exc.status_code,
        content=content,
        headers={"Content-Type": "application/problem+json"}
    )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_totp_secret() -> str:
    return pyotp.random_base32()

def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code)
