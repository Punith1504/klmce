-- ==============================================================================
-- PHASE 3: ENTERPRISE DATA MIGRATION
-- Requirements: Isolated Quarantine for Legacy ETL Conflicts
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS migration;

-- Stores all conflicted, duplicate, or malformed records during ETL ingestion
CREATE TABLE migration.migration_quarantine (
    quarantine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    batch_id UUID NOT NULL,          -- Ties back to a specific ETL run
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'STUDENT', 'ATTENDANCE', 'GRADE'
    row_index INT NOT NULL,
    raw_payload JSONB NOT NULL,       -- The exact messy legacy row
    error_reason TEXT NOT NULL,       -- E.g., 'Foreign Key Mismatch (Missing Course)', 'Duplicate Email'
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure strict multi-tenant isolation even for quarantined data
ALTER TABLE migration.migration_quarantine ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolate_tenant_quarantine ON migration.migration_quarantine 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
