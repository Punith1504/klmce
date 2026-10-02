-- Migration: Zero-Knowledge Grievance & Whistleblower Engine

CREATE SCHEMA IF NOT EXISTS compliance;

CREATE TABLE compliance.whistleblower_reports (
    report_hash_id VARCHAR(64) PRIMARY KEY, -- SHA256 hashed 24-word recovery mnemonic (Ensures mathematical anonymity)
    category VARCHAR(50) NOT NULL CHECK (category IN ('ANTI_RAGGING', 'SAFETY', 'STAFF_MISCONDUCT', 'FINANCIAL_FRAUD')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    pgp_encrypted_payload TEXT NOT NULL, -- PGP Encrypted message contents (Unreadable by database admins/DBAs)
    status VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'ESCALATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance.anonymous_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_hash_id VARCHAR(64) REFERENCES compliance.whistleblower_reports(report_hash_id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('REPORTER', 'COMPLIANCE_OFFICER')),
    pgp_encrypted_message TEXT NOT NULL, -- Two-way encrypted chat layer
    created_at TIMESTAMPTZ DEFAULT NOW()
);
