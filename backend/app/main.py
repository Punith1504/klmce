import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.asyncpg import AsyncPGIntegration

# Core Infrastructure
from app.core.database import db_manager
from app.core.redis import redis_manager
from app.core.security import RFC7807Exception

# Microservice Routers
# Note: Ensure each of these module directories exposes a FastAPI APIRouter named `router`
from app.auth.router import router as auth_router
from app.students.router import router as students_router
from app.attendance.router import router as attendance_router
from app.exams.router import router as exams_router
from app.finance.router import router as finance_router
from app.timetable.router import router as timetable_router
from app.search.router import router as search_router
from app.analytics.router import router as analytics_router
from app.admin.router import router as admin_router
from app.ai.router import router as ai_router
from app.billing.router import router as billing_router

# ==========================================
# Sentry Telemetry Configuration
# ==========================================
def before_send(event, hint):
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]
        # Filter out expected 4xx domain errors to prevent alert fatigue
        if isinstance(exc_value, RFC7807Exception) and exc_value.status_code < 500:
            return None
    return event

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", ""),
    integrations=[
        FastApiIntegration(),
        AsyncPGIntegration(),
    ],
    traces_sample_rate=1.0,
    before_send=before_send,
    environment=os.getenv("ENVIRONMENT", "production")
)

# ==========================================
# Application Lifespan Orchestration
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup sequence ---
    try:
        # Initialize primary data store
        await db_manager.connect()
        # Initialize high-speed cache/idempotency locking
        await redis_manager.connect()
    except Exception as e:
        print(f"CRITICAL BOOT FAILURE: {e}")
        raise e
        
    yield  # Yield execution to the FastAPI router

    # --- Teardown sequence ---
    await db_manager.disconnect()
    await redis_manager.disconnect()

# ==========================================
# Core Application Initialization
# ==========================================
app = FastAPI(
    title="KLMCE Enterprise Education ERP",
    version="1.0.0",
    description="Multi-tenant Zero-Trust ERP Infrastructure",
    lifespan=lifespan,
    docs_url=None, # Disable Swagger in production manually if needed, or route behind auth
    redoc_url=None
)

# ==========================================
# Security & Middleware Configuration
# ==========================================
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,  # Mandatory for transmitting Secure HttpOnly Cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization", 
        "X-CSRF-Token", 
        "X-Bootstrap-Key", 
        "X-Payment-Signature"
    ],
)

# ==========================================
# Global Exception Handlers
# ==========================================
@app.exception_handler(RFC7807Exception)
async def rfc7807_exception_handler(request: Request, exc: RFC7807Exception):
    """
    Globally intercepts custom domain exceptions and outputs strict RFC 7807 JSON.
    This guarantees the Next.js client receives predictable, strictly typed error structures.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": exc.type,
            "title": exc.title,
            "status": exc.status_code,
            "detail": exc.detail,
            "instance": str(request.url)
        },
        headers={"Content-Type": "application/problem+json"}
    )

# ==========================================
# Diagnostic Endpoints
# ==========================================
@app.get("/health", tags=["Diagnostics"])
async def health_check():
    """
    Public readiness probe returning the exact state of underlying connection pools.
    """
    db_status = "offline" if db_manager.pool is None else "healthy"
    redis_status = "offline" if redis_manager.client is None else "healthy"
    
    if db_status == "offline" or redis_status == "offline":
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "database": db_status,
                "redis": redis_status
            }
        )
        
    return {
        "status": "operational",
        "database": db_status,
        "redis": redis_status
    }

# ==========================================
# Router Assembly
# ==========================================
API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=f"{API_PREFIX}/auth", tags=["Authentication"])
app.include_router(students_router, prefix=f"{API_PREFIX}/students", tags=["Student Management"])
app.include_router(attendance_router, prefix=f"{API_PREFIX}/attendance", tags=["Attendance"])
app.include_router(exams_router, prefix=f"{API_PREFIX}/exams", tags=["Examinations"])
app.include_router(finance_router, prefix=f"{API_PREFIX}/finance", tags=["Finance Ledger"])
app.include_router(timetable_router, prefix=f"{API_PREFIX}/timetable", tags=["Timetable Matrix"])
app.include_router(search_router, prefix=f"{API_PREFIX}/search", tags=["AI Semantic Search"])
app.include_router(analytics_router, prefix=f"{API_PREFIX}/analytics", tags=["Data Analytics"])
app.include_router(admin_router, prefix=f"{API_PREFIX}/admin", tags=["Super Admin Operations"])
app.include_router(ai_router, prefix=f"{API_PREFIX}/ai", tags=["Conversational AI Agent"])
app.include_router(billing_router)
