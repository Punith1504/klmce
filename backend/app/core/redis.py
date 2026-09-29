import os
import redis.asyncio as redis
from .security import RFC7807Exception

class RedisManager:
    def __init__(self):
        self.client: redis.Redis | None = None

    async def connect(self):
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            raise ValueError("CRITICAL: REDIS_URL environment variable is missing.")

        max_conns = int(os.getenv("REDIS_MAX_CONNS", "100"))

        # Initialize the connection pool
        pool = redis.ConnectionPool.from_url(
            redis_url,
            max_connections=max_conns,
            decode_responses=True
        )
        self.client = redis.Redis(connection_pool=pool)
        
        # Test connection strictly during startup
        await self.client.ping()

    async def disconnect(self):
        if self.client:
            await self.client.close()

redis_manager = RedisManager()

async def get_redis_client() -> redis.Redis:
    """
    FastAPI Dependency to retrieve the active Redis client.
    """
    if redis_manager.client is None:
        raise RFC7807Exception(
            status_code=503,
            type="probs/redis-unavailable",
            title="Redis Unavailable",
            detail="The caching/idempotency connection pool is currently offline."
        )
    return redis_manager.client
