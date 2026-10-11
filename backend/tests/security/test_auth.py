import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_schema_bug(client: AsyncClient, seed_users):
    """
    RISK COVERED: Authentication query fails due to incorrect schema prefix.
    EXPECTED BEHAVIOR: Returns 200 OK or 401 Unauthorized, not 500.
    """
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "A_STUDENT_LOGIN",
        "password": "TestPassword123!",
        "totp_code": "123456" # MFA code doesn't matter yet if DB fails
    })
    
    # We expect a 401 due to invalid MFA, or 200. But due to 'erp_core' hardcoded, it might return 500.
    assert response.status_code != 500, f"Auth endpoint crashed: {response.text}"

@pytest.mark.asyncio
async def test_mfa_cannot_be_bypassed(client: AsyncClient, seed_users):
    """
    RISK COVERED: Direct post-login API access without completing MFA.
    EXPECTED BEHAVIOR: Calling login without TOTP code fails with 401 for Student.
    """
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "A_STUDENT_LOGIN",
        "password": "TestPassword123!"
    })
    
    # We expect mfa-required
    assert response.status_code == 401
    assert "probs/mfa-required" in response.text

@pytest.mark.asyncio
async def test_login_succeeds_under_rls(client: AsyncClient, seed_users):
    """
    RISK COVERED: Ensure login works before tenant context is set.
    EXPECTED BEHAVIOR: Should return MFA required or successful login for correct credentials.
    """
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "A_STUDENT_LOGIN",
        "password": "TestPassword123!"
    })
    
    # Assuming MFA is required, it returns 401 but with mfa-required, not auth-failed.
    assert response.status_code == 401
    assert response.json()["detail"] == "A TOTP code from your authenticator app is required."

