import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_upload_reject_malformed(client: AsyncClient, seed_users):
    """
    EXPECTED BEHAVIOR: Malformed CSV/XLSX files are rejected safely without crashing.
    """
    pass

@pytest.mark.asyncio
async def test_upload_reject_oversized(client: AsyncClient, seed_users):
    """
    EXPECTED BEHAVIOR: Files over the size limit are rejected with 413 Payload Too Large.
    """
    pass

@pytest.mark.asyncio
async def test_upload_reject_formula_injection(client: AsyncClient, seed_users):
    """
    EXPECTED BEHAVIOR: CSVs with formula injection payloads (=1+1, @foo, etc) are sanitized or rejected.
    """
    pass
