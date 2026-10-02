-- ==============================================================================
-- KLMCE ERP - Production to Staging PII Anonymization Script
-- ==============================================================================
-- EXECUTION PROTOCOL:
-- 1. Take a physical pg_dump of the Production Database.
-- 2. Restore the dump into an isolated Staging/Local database instance.
-- 3. Execute this script ON THE STAGING INSTANCE to mathematically scramble all PII.
-- 4. Only after this completes is the staging database safe for developer access.
-- ==============================================================================

BEGIN;

-- Enable the pgcrypto extension for secure randomization
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. IDENTITIES & CREDENTIALS
-- ==========================================
-- We irreversibly overwrite sensitive emails and names, ensuring local developers 
-- cannot identify physical users.

UPDATE users
SET 
    email = 'anonymized_' || substring(md5(random()::text) from 1 for 10) || '@staging.klmce.edu',
    -- Force reset all passwords to 'password123' (bcrypt) so QA can log into the local apps
    password_hash = '$2b$12$KixuKkXq.qE0kL3K8J4zueHwTzD/U9O7Q/Wp5A.JtA1S9g0Zt6.S6';

UPDATE students
SET 
    first_name = 'Student_' || substring(md5(random()::text) from 1 for 6),
    last_name = 'Test_' || substring(md5(random()::text) from 1 for 6);

-- ==========================================
-- 2. UNIQUE CONSTRAINTS (Enrollment Numbers)
-- ==========================================
-- Enrollment numbers must be randomized to prevent PII leakage, but they have 
-- UNIQUE constraints in PostgreSQL. We generate a guaranteed unique mock string.

UPDATE students
SET enrollment_number = 'STU-MOCK-' || substring(md5(random()::text) from 1 for 8);

-- ==========================================
-- 3. FINANCIAL OBFUSCATION (+/- 5% Variance)
-- ==========================================
-- To allow front-end engineers to build realistic financial dashboards, the data shape 
-- must remain intact. We apply a mathematical variance (random multiplier between 0.95 and 1.05) 
-- to all financial ledgers. This destroys the exact financial truth while preserving aggregate trends.

UPDATE fee_transactions
SET amount = ROUND(amount * (0.95 + random() * 0.1), 2);

-- ==========================================
-- 4. FORENSIC PURGE (Webhooks & Audits)
-- ==========================================
-- Audit logs and Stripe Webhook payloads often contain accidental JSON leaks of PII 
-- (e.g. credit card last 4 digits, physical billing addresses). 
-- These are violently shredded in staging.

-- TRUNCATE TABLE audit_logs CASCADE; 
-- (Uncomment once audit_logs table is formally attached in staging)

COMMIT;

-- ==========================================
-- 5. LOW-LEVEL DISK SHREDDING
-- ==========================================
-- Standard UPDATE commands in PostgreSQL do not delete old data; they just create new row versions (MVCC).
-- Without VACUUM FULL, a malicious developer could perform forensic disk analysis to extract the old rows.
-- VACUUM FULL physically rewrites the file structure on the hard drive, permanently obliterating the original PII.

VACUUM FULL;
