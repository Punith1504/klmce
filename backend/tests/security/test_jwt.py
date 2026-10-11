import pytest
from httpx import AsyncClient
from jose import jwt
from datetime import datetime, timedelta, timezone
import json
import base64

SECRET_KEY = "test_secret_key"

@pytest.mark.asyncio
async def test_jwt_rejects_tampered(client: AsyncClient, seed_users, seeded_tenants):
    """
    EXPECTED BEHAVIOR: A tampered JWT payload fails validation.
    """
    from app.core.security import create_access_token
    token = create_access_token({"sub": str(seed_users["A_STUDENT"]), "tenant_id": str(seeded_tenants["A"]), "role": "STUDENT"})
    
    # Tamper payload
    header, payload, signature = token.split('.')
    payload_dict = json.loads(base64.urlsafe_b64decode(payload + '==').decode('utf-8'))
    payload_dict["role"] = "ADMIN"
    tampered_payload = base64.urlsafe_b64encode(json.dumps(payload_dict).encode('utf-8')).decode('utf-8').rstrip('=')
    tampered_token = f"{header}.{tampered_payload}.{signature}"
    
    response = await client.get("/api/v1/timetable/courses", cookies={"access_token": tampered_token})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_jwt_rejects_expired(client: AsyncClient, seed_users, seeded_tenants):
    from app.core.security import create_access_token
    # Set expiration in the past
    token = create_access_token({"sub": str(seed_users["A_STUDENT"]), "tenant_id": str(seeded_tenants["A"]), "role": "STUDENT", "exp": (datetime.now(timezone.utc) - timedelta(days=1)).timestamp()})
    
    response = await client.get("/api/v1/timetable/courses", cookies={"access_token": token})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_jwt_rejects_alg_none(client: AsyncClient, seed_users, seeded_tenants):
    from app.core.security import create_access_token
    token = create_access_token({"sub": str(seed_users["A_STUDENT"]), "tenant_id": str(seeded_tenants["A"]), "role": "STUDENT"})
    
    # Change alg to none
    header = {"alg": "none", "typ": "JWT"}
    header_enc = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).decode('utf-8').rstrip('=')
    _, payload, _ = token.split('.')
    alg_none_token = f"{header_enc}.{payload}."
    
    response = await client.get("/api/v1/timetable/courses", cookies={"access_token": alg_none_token})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_password_hash_is_bcrypt_or_argon2(sys_db_conn, seed_users):
    """
    EXPECTED BEHAVIOR: Passwords must be hashed safely.
    """
    hash_val = await sys_db_conn.fetchval("SELECT password_hash FROM users WHERE user_id = $1", seed_users["A_STUDENT"])
    assert hash_val.startswith("$2b$") or hash_val.startswith("$argon2"), "VULNERABILITY: Weak password hashing"
