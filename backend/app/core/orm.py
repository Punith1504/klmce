import os
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from .dependencies import get_active_user

engine=None
async def get_db_session(token:dict=Depends(get_active_user)):
    global engine
    if engine is None:
        url=os.environ["DATABASE_URL"].replace("postgres://","postgresql+asyncpg://",1).replace("postgresql://","postgresql+asyncpg://",1)
        engine=create_async_engine(url,pool_size=5,max_overflow=0,pool_timeout=5,pool_pre_ping=True,
            connect_args={"statement_cache_size":0})
    async with async_sessionmaker(engine,expire_on_commit=False)() as session:
        # Every session is transaction-local. Handlers may commit only once after all work.
        await session.execute(text("SELECT set_config('app.current_tenant_id',:tenant,true), set_config('app.current_user_id',:user,true), set_config('app.current_user_role',:role,true)"),
            {"tenant":token["tenant_id"],"user":token["sub"],"role":token["role"]})
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

async def close_engine():
    global engine
    if engine: await engine.dispose()
    engine=None
