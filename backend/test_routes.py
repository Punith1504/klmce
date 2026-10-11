import asyncio
from httpx import AsyncClient
from app.main import app

async def test():
    async with AsyncClient(app=app, base_url="http://test") as c:
        r = await c.get("/api/v1/students")
        print(r.status_code, r.text)
        
        # Test auth paths
        r = await c.get("/api/v1/auth/auth/login")
        print(r.status_code, r.text)
        
        r = await c.post("/api/v1/auth/login")
        print("POST /api/v1/auth/login", r.status_code, r.text)

asyncio.run(test())
