-- Migration: Add fields for specialized login roles and MFA
-- Drop the existing role constraint to add new roles
ALTER TABLE erp_core.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE erp_core.users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN', 'RECRUITER', 'PARENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN', 'FINANCE', 'MANAGEMENT', 'HOD', 'PRINCIPAL'));

-- Add new columns for authentication
ALTER TABLE erp_core.users ADD COLUMN login_id VARCHAR(255) UNIQUE;
ALTER TABLE erp_core.users ADD COLUMN phone_number VARCHAR(20) UNIQUE;
ALTER TABLE erp_core.users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE erp_core.users ADD COLUMN mfa_secret VARCHAR(255);

-- Note: We will use login_id to store:
-- PARENT: numeric ID
-- STUDENT: enrollment ID
-- ADMIN: college ID
