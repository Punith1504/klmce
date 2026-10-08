from fastapi import APIRouter, Depends
from pydantic import BaseModel
import asyncpg
from typing import List

from app.core.database import get_db_connection
from app.core.dependencies import require_roles, Role
from app.core.security import RFC7807Exception

router = APIRouter()

# ==========================================
# Schemas
# ==========================================
class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 3

class SemanticSearchResponse(BaseModel):
    doc_id: str
    title: str
    content: str
    similarity_score: float

# ==========================================
# External AI Subroutine (Mock)
# ==========================================
async def generate_embedding(text: str) -> List[float]:
    """
    Mock function representing an asynchronous call to OpenAI (text-embedding-ada-002) 
    or a localized HuggingFace embedding pipeline (e.g., via sentence-transformers).
    Returns a 1536-dimensional float array.
    """
    # In production: await openai.Embedding.acreate(input=text, model="text-embedding-ada-002")
    return [0.01] * 1536

# ==========================================
# API Endpoint
# ==========================================
@router.post("/semantic", response_model=List[SemanticSearchResponse])
async def perform_semantic_search(
    req: SemanticSearchRequest,
    # Allow all roles; RLS automatically filters tenant data
    token: dict = Depends(require_roles(Role.STUDENT, Role.PARENT, Role.FACULTY, Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    AI Controller: Executes a high-speed HNSW Vector similarity search against institutional policies and documents.
    Enforces Row-Level Security automatically via the injected db connection.
    """
    try:
        # 1. Vectorize the Natural Language Query
        query_vector = await generate_embedding(req.query)
        
        # 2. Execute HNSW Cosine Distance (<=>) Search natively in PostgreSQL
        # Note: The `<=>` operator computes cosine *distance*. 
        # We subtract it from 1 to calculate the cosine *similarity* score.
        sql = """
            SELECT 
                doc_id, 
                title, 
                content, 
                1 - (embedding <=> $1::vector) AS similarity_score
            FROM document_embeddings
            ORDER BY embedding <=> $1::vector ASC
            LIMIT $2
        """
        
        # Cast the python list to the exact string representation expected by the pgvector C-extension: '[0.1, 0.2, ...]'
        formatted_vector = f"[{','.join(map(str, query_vector))}]"
        
        records = await conn.fetch(sql, formatted_vector, req.limit)
        
        return [
            SemanticSearchResponse(
                doc_id=str(r["doc_id"]),
                title=r["title"],
                content=r["content"],
                similarity_score=round(r["similarity_score"], 4)
            ) for r in records
        ]
        
    except Exception as e:
        raise RFC7807Exception(
            status_code=500,
            type="probs/semantic-search-failed",
            title="Vector Engine Failure",
            detail=f"The AI search engine encountered an internal anomaly: {str(e)}"
        )
