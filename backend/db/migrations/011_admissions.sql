-- Migration: Admissions & Automated Provisioning Engine

CREATE SCHEMA IF NOT EXISTS admissions;

CREATE TABLE admissions.dynamic_forms (
    form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    program_id VARCHAR(50) NOT NULL, -- e.g., BTECH_CSE, MTECH_AI
    batch_year INT NOT NULL,
    quota VARCHAR(50) NOT NULL, -- e.g., MANAGEMENT, MERIT, NRI, SPORTS
    schema_json JSONB NOT NULL, -- Flexible configuration for custom fields per quota
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, batch_year, quota)
);

CREATE TABLE admissions.applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    form_id UUID REFERENCES admissions.dynamic_forms(form_id),
    applicant_name VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255) UNIQUE NOT NULL,
    
    form_data JSONB NOT NULL, -- The submitted applicant data
    unlocked_fields JSONB DEFAULT '[]'::jsonb, -- Fields opened by admins for correction
    
    -- State Machine Tracking
    status VARCHAR(50) DEFAULT 'APPLICANT' CHECK (status IN ('APPLICANT', 'REGISTERED', 'PROVISIONAL', 'CONFIRMED', 'WITHDRAWN', 'REJECTED')),
    
    -- Provisioned Credentials
    institutional_email VARCHAR(255) UNIQUE,
    institutional_roll_no VARCHAR(50) UNIQUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admissions.documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES admissions.applications(application_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- '12TH_MARKSHEET', 'TRANSFER_CERTIFICATE'
    s3_key VARCHAR(512) NOT NULL,
    
    verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ
);
