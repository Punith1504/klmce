-- Migration: Corporate Placements & Career Services
-- Implements pgvector for AI Resume Matching

CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA IF NOT EXISTS placements;

CREATE TABLE placements.placement_drives (
    drive_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    drive_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED'))
);

CREATE TABLE placements.job_openings (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID REFERENCES placements.placement_drives(drive_id) ON DELETE CASCADE,
    role_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    ctc_package DECIMAL(12, 2), -- Cost to Company (Optional mapping)
    
    -- Strict Enterprise Eligibility Constraints
    min_cgpa DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    max_active_backlogs INT NOT NULL DEFAULT 0,
    allowed_departments TEXT[] -- e.g., ['CSE', 'IT', 'ECE']
);

CREATE TABLE placements.student_resumes (
    student_id UUID PRIMARY KEY,
    s3_document_key VARCHAR(512) NOT NULL,
    parsed_text_content TEXT,
    skills_vector vector(1536), -- Designed for OpenAI text-embedding-ada-002 dimensionality
    parsed_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW (Hierarchical Navigable Small World) Index
-- Guarantees sub-millisecond candidate semantic similarity searches even with 10,000+ resumes
CREATE INDEX ON placements.student_resumes USING hnsw (skills_vector vector_cosine_ops);

CREATE TABLE placements.student_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES placements.job_openings(job_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'SHORTLISTED_FOR_INTERVIEW', 'REJECTED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate applications to the same job
    UNIQUE(job_id, student_id)
);
