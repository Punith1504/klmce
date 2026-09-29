-- ==============================================================================
-- Enterprise PostgreSQL Schema for Education ERP
-- Architect: Antigravity
-- Description: Multi-tenant database schema with strict RLS policies and 
--              immutable audit logging using PL/pgSQL triggers.
-- ==============================================================================

-- 0. Prerequisites and Setup
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define application database role to which we apply security models
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END
$$;


-- 1. Core Relational Tables (with Tenant IDs)
-- ==============================================================================

-- Tenants Table
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- Users Table (Parents, Staff, etc.)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    role VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Sensitive: Will be excluded from audit
    mfa_secret VARCHAR(255),             -- Sensitive: Will be excluded from audit
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE (tenant_id, email)
);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);

-- Students Table
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    parent_id UUID REFERENCES users(user_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    enrollment_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE (tenant_id, enrollment_number)
);
CREATE INDEX idx_students_tenant_id ON students(tenant_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);

-- Exam Marks Table
CREATE TABLE exam_marks (
    mark_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    student_id UUID NOT NULL REFERENCES students(student_id),
    subject VARCHAR(100) NOT NULL,
    marks_obtained NUMERIC(5,2) NOT NULL,
    max_marks NUMERIC(5,2) NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
CREATE INDEX idx_exam_marks_tenant_id ON exam_marks(tenant_id);
CREATE INDEX idx_exam_marks_student_id ON exam_marks(student_id);
CREATE INDEX idx_exam_marks_date ON exam_marks(exam_date);

-- Attendance Records Table
CREATE TABLE attendance_records (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    student_id UUID NOT NULL REFERENCES students(student_id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
CREATE INDEX idx_attendance_tenant_id ON attendance_records(tenant_id);
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- Fee Transactions Table
CREATE TABLE fee_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    student_id UUID NOT NULL REFERENCES students(student_id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT clock_timestamp(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'))
);
CREATE INDEX idx_fee_tx_tenant_id ON fee_transactions(tenant_id);
CREATE INDEX idx_fee_tx_student_id ON fee_transactions(student_id);
CREATE INDEX idx_fee_tx_status ON fee_transactions(status);


-- 2. Multi-Tenancy & Row-Level Security (RLS)
-- ==============================================================================

-- Enable RLS on all operational tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_transactions ENABLE ROW LEVEL SECURITY;

-- Base Tenant Isolation Policies (FOR ALL)
-- Requires setting the session variable: `SET app.current_tenant_id = '<uuid>';`
CREATE POLICY tenant_isolation_users ON users FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

CREATE POLICY tenant_isolation_students ON students FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

CREATE POLICY tenant_isolation_exam_marks ON exam_marks FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

CREATE POLICY tenant_isolation_attendance ON attendance_records FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

CREATE POLICY tenant_isolation_fees ON fee_transactions FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

-- Explicit Relational Constraint: Parents Querying Students
-- Restrictive policy: If the user is a PARENT, they can strictly only query their own students.
-- Non-parents (e.g. teachers/admins) bypass this restrictive condition.
CREATE POLICY parent_student_isolation ON students AS RESTRICTIVE FOR SELECT
    USING (
        current_setting('app.current_user_role', TRUE) != 'PARENT' 
        OR parent_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    );


-- 3. Immutable Audit Logs
-- ==============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    performed_by UUID, -- Can be NULL if performed by an automated system process
    endpoint_signature VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT clock_timestamp(),
    old_values JSONB,
    new_values JSONB
);

-- Indexing for fast analytical querying of audit logs
CREATE INDEX idx_audit_logs_tenant_table ON audit_logs(tenant_id, table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Prevent any modification or deletion of audit logs by the application user
REVOKE UPDATE, DELETE ON audit_logs FROM app_user;
-- Assuming app_user at least has insert, or we handle it via SECURITY DEFINER in the trigger function.


-- 4. Audit Log Trigger Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_old_values JSONB;
    v_new_values JSONB;
    v_delta_old JSONB := '{}'::JSONB;
    v_delta_new JSONB := '{}'::JSONB;
    v_key TEXT;
    v_val JSONB;
    v_tenant_id UUID;
    v_record_id VARCHAR(255);
    v_performed_by UUID;
    v_endpoint_signature VARCHAR(255);
    v_pk_col VARCHAR := TG_ARGV[0]; -- The primary key column name passed as an argument
BEGIN
    -- Extract execution context (silently fallback to NULL if settings aren't present in session)
    BEGIN
        v_performed_by := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
    EXCEPTION WHEN OTHERS THEN v_performed_by := NULL;
    END;
    
    BEGIN
        v_endpoint_signature := current_setting('app.endpoint_signature', TRUE);
    EXCEPTION WHEN OTHERS THEN v_endpoint_signature := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        v_new_values := to_jsonb(NEW);
        
        -- Strip out highly sensitive fields from logs
        v_new_values := v_new_values - 'password_hash' - 'mfa_secret';
        
        v_tenant_id := (v_new_values->>'tenant_id')::UUID;
        v_record_id := v_new_values->>v_pk_col;

        INSERT INTO audit_logs (tenant_id, table_name, record_id, action, performed_by, endpoint_signature, old_values, new_values)
        VALUES (v_tenant_id, TG_TABLE_NAME, v_record_id, TG_OP, v_performed_by, v_endpoint_signature, NULL, v_new_values);
        
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD) - 'password_hash' - 'mfa_secret';
        v_new_values := to_jsonb(NEW) - 'password_hash' - 'mfa_secret';

        -- Compute strict key-by-key delta
        FOR v_key, v_val IN SELECT * FROM jsonb_each(v_new_values)
        LOOP
            IF v_old_values->v_key IS DISTINCT FROM v_val THEN
                v_delta_old := jsonb_set(v_delta_old, ARRAY[v_key], COALESCE(v_old_values->v_key, 'null'::jsonb));
                v_delta_new := jsonb_set(v_delta_new, ARRAY[v_key], v_val);
            END IF;
        END LOOP;

        -- Commit to audit log ONLY if a substantive attribute changed
        IF v_delta_new != '{}'::JSONB THEN
            v_tenant_id := (v_new_values->>'tenant_id')::UUID;
            v_record_id := v_new_values->>v_pk_col;

            INSERT INTO audit_logs (tenant_id, table_name, record_id, action, performed_by, endpoint_signature, old_values, new_values)
            VALUES (v_tenant_id, TG_TABLE_NAME, v_record_id, TG_OP, v_performed_by, v_endpoint_signature, v_delta_old, v_delta_new);
        END IF;
        
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD) - 'password_hash' - 'mfa_secret';
        
        v_tenant_id := (v_old_values->>'tenant_id')::UUID;
        v_record_id := v_old_values->>v_pk_col;

        INSERT INTO audit_logs (tenant_id, table_name, record_id, action, performed_by, endpoint_signature, old_values, new_values)
        VALUES (v_tenant_id, TG_TABLE_NAME, v_record_id, TG_OP, v_performed_by, v_endpoint_signature, v_old_values, NULL);
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Notice SECURITY DEFINER: This bypasses normal table permissions, allowing the audit trigger 
-- to write directly into `audit_logs` without explicitly granting the application user INSERT rights.

-- 5. Attach Triggers to Tables
-- ==============================================================================
-- Pass the primary key string so the trigger dynamically logs the correct record ID

CREATE TRIGGER audit_exam_marks_trigger
AFTER INSERT OR UPDATE OR DELETE ON exam_marks
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('mark_id');

CREATE TRIGGER audit_attendance_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('attendance_id');

CREATE TRIGGER audit_fee_transactions_trigger
AFTER INSERT OR UPDATE OR DELETE ON fee_transactions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('transaction_id');

CREATE TRIGGER audit_students_trigger
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('student_id');

-- 6. Timetable & Scheduling
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Ensure custom range type for TIME exists
DO $$ BEGIN
    CREATE TYPE timerange AS RANGE (subtype = time);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE timetable_slots (
    slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    course_id UUID NOT NULL,
    section_id UUID NOT NULL,
    faculty_id UUID NOT NULL REFERENCES users(user_id),
    room_number VARCHAR(50) NOT NULL,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT prevent_room_overlap EXCLUDE USING gist (
        tenant_id WITH =,
        room_number WITH =,
        day_of_week WITH =,
        timerange(start_time, end_time) WITH &&
    ),
    CONSTRAINT prevent_faculty_double_booking EXCLUDE USING gist (
        tenant_id WITH =,
        faculty_id WITH =,
        day_of_week WITH =,
        timerange(start_time, end_time) WITH &&
    )
);
CREATE INDEX idx_timetable_tenant_id ON timetable_slots(tenant_id);
CREATE INDEX idx_timetable_faculty_id ON timetable_slots(faculty_id);
CREATE INDEX idx_timetable_section_id ON timetable_slots(section_id);

ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_timetable ON timetable_slots FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

CREATE TRIGGER audit_timetable_slots_trigger
AFTER INSERT OR UPDATE OR DELETE ON timetable_slots
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('slot_id');

-- ==============================================================================
-- End of Schema Definition
-- ==============================================================================
