import time
import uuid
from fastapi import Request, Depends, HTTPException
from app.core.redis import get_redis_client

# One atomic operation, no untrusted identity headers, no colliding ZSET members.
SCRIPT = """
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
local count = redis.call('ZCARD', KEYS[1])
if count >= tonumber(ARGV[3]) then return 0 end
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[5])
redis.call('EXPIRE', KEYS[1], ARGV[4])
return 1
"""
class RateLimiter:
    def __init__(self,max_requests,window_seconds):
        self.max_requests,self.window_seconds=max_requests,window_seconds
    async def __call__(self,request:Request,redis=Depends(get_redis_client)):
        ip=request.client.host if request.client else 'unknown'
        key=f"rate_limit:{request.url.path}:ip:{ip}"
        await self.check(redis,key)

    async def check(self,redis,key):
        now=int(time.time()*1000)
        accepted=await redis.eval(SCRIPT,1,key,now-self.window_seconds*1000,now,
            self.max_requests,self.window_seconds,str(uuid.uuid4()))
        if not accepted: raise HTTPException(429,"Too many requests",headers={"Retry-After":str(self.window_seconds)})

from app.core.dependencies import get_active_user
async def student_scan_limit(request:Request, token:dict=Depends(get_active_user), redis=Depends(get_redis_client)):
    # Use only the verified server principal, so a campus NAT can serve many students.
    await RateLimiter(20,60).check(redis,f"rate_limit:scan:{token['tenant_id']}:{token['sub']}")
