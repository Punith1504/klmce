-- ==============================================================================
-- KLMCE ERP - AI Semantic Search & Vector Database Configuration
-- ==============================================================================

-- 1. Initialize PostgreSQL Vector Extension
-- Requires the pgvector extension to be compiled/installed on the host database.
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Construct the Vector Storage Table
CREATE TABLE IF NOT EXISTS document_embeddings (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    -- 1536 dimensions specifically matches OpenAI's `text-embedding-ada-002` outputs.
    -- Adjust to 384 for local HuggingFace `all-MiniLM-L6-v2` pipelines.
    embedding vector(1536) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HNSW (Hierarchical Navigable Small World) Index
-- HNSW is significantly faster than IVFFlat for high-dimensional nearest-neighbor searches.
-- We specify `vector_cosine_ops` because Cosine Similarity is the mathematical standard for NLP embeddings.
CREATE INDEX idx_hnsw_document_embeddings 
ON document_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ==============================================================================
-- ZERO-TRUST DATA ISOLATION (RLS)
-- ==============================================================================
-- Ensure the Vector Database adheres to the global multi-tenant constraints.

ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON document_embeddings
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
