import os
import asyncpg
from typing import AsyncGenerator
from .security import RFC7807Exception

class DatabaseManager:
    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("CRITICAL: DATABASE_URL environment variable is missing.")

        min_conns = int(os.getenv("DB_MIN_CONNS", "5"))
        max_conns = int(os.getenv("DB_MAX_CONNS", "20"))

        self.pool = await asyncpg.create_pool(
            dsn=db_url,
            min_size=min_conns,
            max_size=max_conns,
            command_timeout=60,
        )

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

db_manager = DatabaseManager()

async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """
    FastAPI Dependency to acquire a database connection from the pool.
    Automatically wraps the yielded connection inside an explicit database transaction.
    """
    if db_manager.pool is None:
        raise RFC7807Exception(
            status_code=503,
            type="probs/database-unavailable",
            title="Database Unavailable",
            detail="The database connection pool has not been initialized or is offline."
        )

    # Acquire connection from the pool
    async with db_manager.pool.acquire() as connection:
        # Wrap the request boundary in a single atomic transaction
        async with connection.transaction():
            yield connection
