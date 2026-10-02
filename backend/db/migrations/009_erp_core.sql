-- Migration: ERP Core Schema with Multi-Tenant Row-Level Security (RLS)
CREATE SCHEMA IF NOT EXISTS erp_core;

-- ==========================================
-- 1. Multi-Tenant Master Foundation
-- ==========================================
CREATE TABLE erp_core.tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE
);

CREATE TABLE erp_core.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN', 'RECRUITER')),
    first_name VARCHAR(100),
    last_name VARCHAR(100)
);

-- ==========================================
-- 2. Admissions Engine
-- ==========================================
CREATE TABLE erp_core.application_forms (
    form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    schema_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE erp_core.applicants (
    applicant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    form_id UUID REFERENCES erp_core.application_forms(form_id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'APPLICANT' CHECK (status IN ('APPLICANT', 'REGISTERED', 'PROVISIONAL', 'CONFIRMED', 'REJECTED')),
    submitted_data JSONB
);

-- ==========================================
-- 3. Academics & LMS Engine
-- ==========================================
CREATE TABLE erp_core.courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    UNIQUE(tenant_id, course_code)
);

CREATE TABLE erp_core.student_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    student_id UUID REFERENCES erp_core.users(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES erp_core.courses(course_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ENROLLED',
    UNIQUE(student_id, course_id)
);

-- ==========================================
-- 4. Campus Logistics Engine
-- ==========================================
CREATE TABLE erp_core.hostel_blocks (
    block_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    warden_id UUID REFERENCES erp_core.users(user_id)
);

CREATE TABLE erp_core.rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    block_id UUID REFERENCES erp_core.hostel_blocks(block_id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE erp_core.canteen_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES erp_core.tenants(tenant_id) ON DELETE CASCADE,
    student_id UUID REFERENCES erp_core.users(user_id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    meal_type VARCHAR(50)
);

-- ==========================================
-- STRICT ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enforces that data can NEVER bleed across different tenants/colleges

ALTER TABLE erp_core.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.application_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.hostel_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_core.canteen_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_tenant_users ON erp_core.users USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_forms ON erp_core.application_forms USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_applicants ON erp_core.applicants USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_courses ON erp_core.courses USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_enrollments ON erp_core.student_enrollments USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_hostels ON erp_core.hostel_blocks USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_rooms ON erp_core.rooms USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
CREATE POLICY rls_tenant_canteen ON erp_core.canteen_transactions USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
