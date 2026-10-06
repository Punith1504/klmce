"""Verify externally issued sessions against a fixed, operator-configured issuer."""
import os
import json
import httpx
from jose import jwt, JWTError
from fastapi import HTTPException
from .redis import get_redis_client

async def verify_clerk_token(token):
    issuer=os.getenv("CLERK_ISSUER", "").rstrip("/")
    if not issuer.startswith("https://"): raise HTTPException(503,"Identity provider is not configured")
    try:
        header=jwt.get_unverified_header(token)
        if header.get("alg") != "RS256" or not header.get("kid"): raise ValueError()
        redis=await get_redis_client()
        cache_key="clerk:jwks:"+issuer
        cached=await redis.get(cache_key)
        if cached: keys=json.loads(cached)
        else:
            async with httpx.AsyncClient(timeout=5,follow_redirects=False) as client:
                response=await client.get(issuer+"/.well-known/jwks.json")
                response.raise_for_status(); keys=response.json()
            await redis.set(cache_key,json.dumps(keys),ex=300)
        key=next((k for k in keys["keys"] if k.get("kid")==header["kid"]),None)
        if key is None:
            await redis.delete(cache_key)
            raise ValueError()
        audience=os.getenv("CLERK_AUDIENCE")
        claims=jwt.decode(token,key,algorithms=["RS256"],issuer=issuer,audience=audience,
            options={"require_exp":True,"require_sub":True,"verify_aud":bool(audience)})
        if claims.get("azp") != os.environ["FRONTEND_URL"] or claims.get("sts")=="pending" or claims.get("act"):
            raise ValueError()
        if not isinstance(claims.get("sid"),str) or claims.get("v")!=2: raise ValueError()
        return claims
    except (JWTError,ValueError,KeyError,TypeError):
        raise HTTPException(401,"Invalid identity-provider session") from None
    except httpx.HTTPError:
        raise HTTPException(503,"Identity provider unavailable") from None
