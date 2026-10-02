import time
from fastapi import Request, Depends
import redis.asyncio as aioredis
from app.core.redis import get_redis_client
from app.core.security import RFC7807Exception

class RateLimiter:
    """
    Advanced Sliding-Window Rate Limiter.
    Utilizes Redis Sorted Sets (ZSET) to track exact millisecond timestamps of incoming requests.
    This entirely prevents the "burst at the edge of the window" vulnerability found in basic Fixed-Window counters.
    """
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request, redis: aioredis.Redis = Depends(get_redis_client)):
        # 1. Identify the Client
        client_ip = request.client.host if request.client else "127.0.0.1"
        
        # If the user is authenticated, we bind the limit to their JWT subject ID.
        # Otherwise, we fallback to the raw IP address.
        user_id = request.headers.get("x-user-id", "")
        identifier = f"user:{user_id}" if user_id else f"ip:{client_ip}"
        
        # Key namespace prevents collisions across different API endpoints
        redis_key = f"rate_limit:{request.url.path}:{identifier}"
        
        current_time = int(time.time() * 1000)
        window_start = current_time - (self.window_seconds * 1000)

        # 2. Execute Atomic Redis Pipeline
        async with redis.pipeline(transaction=True) as pipe:
            # Remove all timestamps older than the sliding window
            pipe.zremrangebyscore(redis_key, 0, window_start)
            # Count the remaining valid requests in the current window
            pipe.zcard(redis_key)
            # Add the current request's timestamp
            pipe.zadd(redis_key, {str(current_time): current_time})
            # Enforce an expiration to prevent infinite memory leakage
            pipe.expire(redis_key, self.window_seconds)
            
            results = await pipe.execute()
        
        # results[1] maps to the zcard() response (the request count BEFORE this current one is added)
        request_count = results[1]

        # 3. Enforce Threshold & Emit RFC 7807 Problem Detail
        if request_count >= self.max_requests:
            raise RFC7807Exception(
                status_code=429,
                type="probs/rate-limit-exceeded",
                title="Too Many Requests",
                detail=f"Aggressive traffic detected. Limit of {self.max_requests} requests per {self.window_seconds}s exceeded.",
                headers={"Retry-After": str(self.window_seconds)}
            )
