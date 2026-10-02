import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext

# Note: In a real architecture, these are imported from core config
SECRET_KEY = "oauth-secret-key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/oauth", tags=["OAuth2 Provider"])

# ==========================================
# Schema Definitions
# ==========================================
class OAuthAppCreate(BaseModel):
    app_name: str
    redirect_uris: List[str]

class TokenRequest(BaseModel):
    grant_type: str
    client_id: str
    client_secret: str
    code: Optional[str] = None
    redirect_uri: Optional[str] = None

# ==========================================
# Developer Portal Routes
# ==========================================
@router.post("/developer/apps", status_code=status.HTTP_201_CREATED)
async def register_developer_app(app_data: OAuthAppCreate):
    """
    Called by the Developer Portal UI to register a new 3rd-party application.
    Generates a secure client_id and client_secret.
    """
    client_id = f"klmce_{secrets.token_urlsafe(16)}"
    raw_secret = secrets.token_urlsafe(32)
    secret_hash = pwd_context.hash(raw_secret)
    
    # In production, this saves to oauth.developer_apps in Postgres
    
    return {
        "message": "Application registered successfully",
        "app_name": app_data.app_name,
        "client_id": client_id,
        "client_secret": raw_secret, # Only shown once!
        "redirect_uris": app_data.redirect_uris,
        "billing_tier": "FREE"
    }

# ==========================================
# OAuth2 Authorization Code Flow
# ==========================================
@router.get("/authorize")
async def authorize_prompt(client_id: str, redirect_uri: str, response_type: str, scope: str):
    """
    Step 1: The 3rd-party app redirects the user here. 
    Returns an HTML consent screen (or redirects to the Next.js consent UI).
    """
    if response_type != "code":
        raise HTTPException(status_code=400, detail="Unsupported response type")
    
    # (Production: Validate client_id and redirect_uri against DB)
    
    # Normally this endpoint renders a consent UI asking:
    # "Application X wants access to your Attendance. [Allow] [Deny]"
    return {"consent_url": f"/oauth/consent?client_id={client_id}&scope={scope}&redirect_uri={redirect_uri}"}

@router.post("/token")
async def exchange_token(request: TokenRequest):
    """
    Step 2: Exchange Authorization Code for Access Token
    """
    if request.grant_type != "authorization_code":
        raise HTTPException(status_code=400, detail="Only authorization_code grant is supported")
        
    # (Production: Verify client_id, client_secret_hash, and auth_code from DB)
    
    # Issue a highly scoped, short-lived JWT for the 3rd-party app
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    access_token_payload = {
        "sub": "mock-user-id",
        "client_id": request.client_id,
        "scopes": ["read:attendance", "write:assignments"], # Derived from the auth_code record
        "exp": expire,
        "type": "external_api"
    }
    
    token = jwt.encode(access_token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 3600,
        "scope": "read:attendance write:assignments"
    }
