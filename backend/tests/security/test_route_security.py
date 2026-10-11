import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_all_routes_require_auth(client: AsyncClient):
    """
    EXPECTED BEHAVIOR: All non-auth routes should return 401 Unauthorized or 403 Forbidden
    when accessed without a valid JWT token.
    """
    allowlist = [
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/v1/auth/login",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/api/v1/auth/oauth2/callback",
        "/health",
        "/api/v1/health"
    ]
    
    for route in app.routes:
        if not hasattr(route, "methods"):
            continue
            
        path = route.path
        if path in allowlist:
            continue
            
        # Get the first allowed method
        method = next(iter(route.methods))
        if method == "HEAD" or method == "OPTIONS":
            continue
            
        # Perform an unauthenticated request
        response = await client.request(method, path)
        
        # It must be 401 or 403. If it is 422, it means the request validation failed 
        # BEFORE auth, which is bad (auth should always run first).
        assert response.status_code in [401, 403], f"Route {method} {path} is unprotected! Returned {response.status_code}"

@pytest.mark.asyncio
async def test_no_raw_db_imports_in_routers():
    """
    Ensure no router imports get_db_connection or get_db_pool from app.core.database directly.
    They must use app.core.dependencies.
    """
    import os
    import ast
    
    base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "app")
    
    for root, _, files in os.walk(base_dir):
        if "router.py" in files or "routers.py" in files:
            for file in files:
                if file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        tree = ast.parse(f.read(), filename=file_path)
                        
                    for node in ast.walk(tree):
                        if isinstance(node, ast.ImportFrom):
                            if node.module == "app.core.database":
                                for name in node.names:
                                    if name.name in ["get_db_connection", "get_db_pool"]:
                                        pytest.fail(f"SECURITY VIOLATION: {file_path} imports {name.name} directly from app.core.database. It MUST use app.core.dependencies to enforce RLS and JWT.")

