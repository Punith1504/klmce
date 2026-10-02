from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncpg

from app.core.database import get_db_connection
from app.core.security import require_roles, Role
from app.ai.agent import run_conversational_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_agent(
    req: ChatRequest,
    # Zero-Trust verification limits access to authenticated stakeholders
    token: dict = Depends(require_roles(Role.STUDENT, Role.PARENT, Role.FACULTY)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Streaming Conversational RAG Endpoint.
    Maintains a persistent HTTP connection to stream LLM tokens via Server-Sent Events (SSE).
    The underlying `asyncpg` connection guarantees all SQL or Vector operations are implicitly 
    restricted by the caller's Tenant ID via Row-Level Security.
    """
    
    tenant_id = str(token["tenant_id"])
    user_id = str(token["sub"])
    
    # Instantiate the asynchronous token generator
    generator = run_conversational_agent(req.message, conn, tenant_id, user_id)
    
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Critical directive to bypass Nginx or reverse-proxy buffering
            # ensuring the Next.js frontend receives individual tokens instantly.
            "X-Accel-Buffering": "no" 
        }
    )
