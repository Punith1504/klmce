import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db_manager
from app.core.redis import redis_manager
from app.core.orm import close_engine
from app.core.security import SECRET_KEY, validate_secret, RFC7807Exception, rfc7807_exception_handler
from app.attendance.qr_crypto import key_bytes
from app.core.auth import router as auth_router
from app.students.router import router as students_router
from app.attendance.router import router as attendance_router
from app.exams.router import router as exams_router
from app.finance.router import router as finance_router
from app.timetable.router import router as timetable_router
from app.analytics.router import router as analytics_router

@asynccontextmanager
async def lifespan(app):
    validate_secret(SECRET_KEY,'SECRET_KEY')
    key_bytes('ATTENDANCE_AES_KEY'); key_bytes('ATTENDANCE_HMAC_KEY')
    if not os.getenv('FRONTEND_URL'): raise RuntimeError('FRONTEND_URL is required')
    try:
        await db_manager.connect()
        await redis_manager.connect()
        yield
    finally:
        await close_engine()
        await redis_manager.disconnect()
        await db_manager.disconnect()

app=FastAPI(title='KLMCE ERP',version='1.1.0',lifespan=lifespan,docs_url=None,redoc_url=None,openapi_url=None)
app.add_exception_handler(RFC7807Exception,rfc7807_exception_handler)
app.add_middleware(CORSMiddleware,allow_origins=[os.getenv('FRONTEND_URL','http://localhost:3000')],
    allow_credentials=True,allow_methods=['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allow_headers=['Content-Type','Authorization','X-Payment-Signature'])

@app.middleware('http')
async def protect_requests(request:Request,call_next):
    # Cookie-authenticated mutations and login must originate from our UI.
    # Bearer credentials and signed server-to-server webhooks do not use cookies.
    if request.method in {'POST','PUT','PATCH','DELETE'}:
        bearer=request.headers.get('authorization','').startswith('Bearer ')
        webhook=request.url.path=='/api/v1/finance/webhook'
        if not bearer and not webhook and request.headers.get('origin')!=os.getenv('FRONTEND_URL'):
            return JSONResponse(status_code=403,content={'detail':'Untrusted request origin'})
    response=await call_next(request)
    response.headers['Cache-Control']='no-store'
    response.headers['X-Content-Type-Options']='nosniff'
    response.headers['Referrer-Policy']='same-origin'
    return response

@app.get('/live')
async def live(): return {'status':'alive'}

@app.get('/health')
async def health():
    try:
        async with asyncio.timeout(3):
            if db_manager.pool is None or redis_manager.client is None: raise RuntimeError()
            async with db_manager.pool.acquire(timeout=2) as conn: await conn.fetchval('SELECT 1')
            await redis_manager.client.ping()
        return {'status':'ready'}
    except Exception:
        return JSONResponse(status_code=503,content={'status':'unavailable'})

for prefix,router in [('auth',auth_router),('students',students_router),('attendance',attendance_router),
    ('exams',exams_router),('finance',finance_router),('timetable',timetable_router),('analytics',analytics_router)]:
    app.include_router(router,prefix='/api/v1/'+prefix)
