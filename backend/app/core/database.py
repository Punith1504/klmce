import os
import asyncpg
from fastapi import Depends, HTTPException
from .dependencies import get_active_user

class DatabaseManager:
    def __init__(self): self.pool = None
    async def connect(self):
        url=os.environ["DATABASE_URL"]
        if not url.startswith(("postgres://","postgresql://")):
            raise RuntimeError("DATABASE_URL must use the asyncpg postgresql:// format")
        self.pool=await asyncpg.create_pool(dsn=url,min_size=int(os.getenv("DB_MIN_CONNS","2")),
            max_size=int(os.getenv("DB_MAX_CONNS","10")),command_timeout=15,
            statement_cache_size=int(os.getenv("DB_STATEMENT_CACHE_SIZE","100")))
        async with self.pool.acquire() as conn:
            unsafe=await conn.fetchval("SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user")
            owner=await conn.fetchval("SELECT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname='public' AND tableowner=current_user)")
        if unsafe or owner:
            await self.disconnect()
            raise RuntimeError("Application database role must not own tables or bypass RLS")
    async def disconnect(self):
        if self.pool: await self.pool.close()
        self.pool=None

db_manager=DatabaseManager()

async def get_db_pool():
    if db_manager.pool is None: raise HTTPException(503,"Database unavailable")
    return db_manager.pool

async def get_db_connection(token_payload:dict=Depends(get_active_user)):
    if not isinstance(token_payload,dict): raise HTTPException(401,"Authenticated database context required")
    pool=await get_db_pool()
    async with pool.acquire(timeout=5) as conn:
        async with conn.transaction():
            await conn.execute("SELECT set_config('app.current_tenant_id',$1,true), set_config('app.current_user_id',$2,true), set_config('app.current_user_role',$3,true)",
                token_payload["tenant_id"],token_payload["sub"],token_payload["role"])
            yield conn
