import json
import asyncio
from typing import AsyncGenerator
import asyncpg
from app.search.router import generate_embedding

# ==============================================================================
# KLMCE Agentic RAG (Retrieval-Augmented Generation) Workflow
# ==============================================================================

# Strict guardrails to prevent prompt-injection and hallucinated PII
SYSTEM_PROMPT = """You are the KLMCE Institutional Assistant, a secure AI agent serving students, parents, and faculty.
You operate on a Zero-Trust architecture.
You have access to two distinct execution tools:
1. SQL_QUERY: Dynamically execute SQL to fetch real-time structured data (e.g. attendance, exams).
2. SEMANTIC_SEARCH: Query institutional policies, rulebooks, and unstructured text via vector similarity.

CRITICAL DIRECTIVES:
- Under NO circumstances will you hallucinate academic grades, financial dues, or attendance statuses.
- If the required data is missing from the database or ambiguous, you MUST output verbatim: "Please contact administration for further assistance."
- You are protected by physical Row-Level Security. Do not attempt to override tenant IDs or execute cross-tenant JOINs.
- Never execute UPDATE, DELETE, or DROP operations.
"""

async def run_conversational_agent(query: str, conn: asyncpg.Connection, tenant_id: str, user_id: str) -> AsyncGenerator[str, None]:
    """
    Simulates a sophisticated Agentic RAG workflow leveraging LangChain/LlamaIndex.
    Acts as an orchestration engine deciding between Text-to-SQL or Vector Search.
    Streams resulting tokens via Server-Sent Events (SSE).
    """
    
    # 1. Initial Handshake Stream
    yield f"data: {json.dumps({'token': 'Analyzing intent...\\n'})}\n\n"
    await asyncio.sleep(0.3)
    
    # 2. Agentic Tool Routing (Simulated LLM Intent Classification)
    # In production, an LLM evaluates the prompt to choose the physical tool.
    is_policy_query = any(keyword in query.lower() for keyword in ["policy", "rule", "refund", "summarize", "document"])
    
    if is_policy_query:
        yield f"data: {json.dumps({'token': '[Executing HNSW Vector Search against pgvector...]\\n'})}\n\n"
        
        # Tool: SEMANTIC_SEARCH
        vector = await generate_embedding(query)
        formatted_vector = f"[{','.join(map(str, vector))}]"
        
        # We physically execute the cosine distance search. RLS is automatically active on this connection.
        sql = """
            SELECT title, content FROM document_embeddings 
            ORDER BY embedding <=> $1::vector ASC LIMIT 2
        """
        records = await conn.fetch(sql, formatted_vector)
        
        if not records:
            context = "No specific policy found."
        else:
            context = " ".join([r['content'] for r in records])
        
        # Simulated LLM Synthesis (Synthesizing the exact vector content)
        final_answer = f"Based on institutional records: {context}"
        
    else:
        yield f"data: {json.dumps({'token': '[Executing Protected Text-to-SQL Sub-query...]\\n'})}\n\n"
        
        # Tool: SQL_QUERY
        # In a real LangChain SQLAgent, the LLM safely generates this read-only query based on the schema definitions.
        # We simulate fetching recent attendance strictly scoped to the requesting user_id.
        sql = """
            SELECT status, date FROM attendance_records 
            WHERE student_id = $1::uuid 
            ORDER BY date DESC LIMIT 5
        """
        try:
            records = await conn.fetch(sql, user_id)
            if not records:
                final_answer = "I could not find any recent records. Please contact administration for further assistance."
            else:
                status_list = ", ".join([f"{r['date'].strftime('%Y-%m-%d')}: {r['status']}" for r in records])
                final_answer = f"I have pulled the latest real-time data from the database. Your recent attendance statuses are: {status_list}."
        except Exception:
            final_answer = "An error occurred accessing the database. Please contact administration for further assistance."

    # 3. Stream the LLM synthesis back to the frontend token-by-token
    # This prevents the user from waiting 5 seconds for a monolithic HTTP response.
    for word in final_answer.split():
        yield f"data: {json.dumps({'token': word + ' '})}\n\n"
        await asyncio.sleep(0.05) # Simulate token generation latency

    # 4. Terminate the SSE Stream cleanly
    yield "data: [DONE]\n\n"
