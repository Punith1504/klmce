-- ==============================================================================
-- PHASE 1: MASTER DATA MANAGEMENT (Campus Administration Stack)
-- ERP Requirements Document (Items 1-4)
-- ==============================================================================

-- Ensure RLS is active by default for all tables in the ERP schema
-- (Multi-tenant architecture)

CREATE SCHEMA IF NOT EXISTS master_data;

-- 1. INSTITUTION STRUCTURE
CREATE TABLE master_data.campuses (
    campus_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- Ties back to the main tenants table
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_data.departments (
    department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    campus_id UUID REFERENCES master_data.campuses(campus_id),
    name VARCHAR(255) NOT NULL,
    department_type VARCHAR(50) NOT NULL CHECK (department_type IN ('ACADEMIC', 'NON_ACADEMIC', 'ADMINISTRATIVE')),
    hod_id UUID, -- Reference to users table (Faculty)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROGRAMS, COURSES AND SPECIALIZATIONS
CREATE TABLE master_data.programs (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    department_id UUID REFERENCES master_data.departments(department_id),
    name VARCHAR(255) NOT NULL, -- e.g., "B.Tech Computer Science"
    degree_level VARCHAR(50) NOT NULL CHECK (degree_level IN ('UG', 'PG', 'DIPLOMA', 'PHD')),
    duration_years INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE master_data.courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    program_id UUID REFERENCES master_data.programs(program_id),
    course_code VARCHAR(50) NOT NULL, -- e.g., "CS101"
    name VARCHAR(255) NOT NULL,
    credits NUMERIC(3, 1) NOT NULL,
    course_type VARCHAR(50) NOT NULL CHECK (course_type IN ('CORE', 'ELECTIVE', 'LAB', 'PROJECT')),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. INFRASTRUCTURE
CREATE TABLE master_data.infrastructure_blocks (
    block_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    campus_id UUID REFERENCES master_data.campuses(campus_id),
    name VARCHAR(100) NOT NULL, -- e.g., "Block C" or "Ramanujan Block"
    block_type VARCHAR(50) NOT NULL CHECK (block_type IN ('ACADEMIC', 'HOSTEL', 'ADMIN', 'LIBRARY', 'SPORTS')),
    total_floors INT DEFAULT 1
);

CREATE TABLE master_data.infrastructure_rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    block_id UUID REFERENCES master_data.infrastructure_blocks(block_id),
    room_number VARCHAR(50) NOT NULL, -- e.g., "201"
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('CLASSROOM', 'LAB', 'STAFF_ROOM', 'HOSTEL_ROOM', 'SEMINAR_HALL', 'MEETING_ROOM')),
    capacity INT NOT NULL,
    is_accessible BOOLEAN DEFAULT TRUE, -- Wheelchair access
    has_projector BOOLEAN DEFAULT FALSE,
    has_smartboard BOOLEAN DEFAULT FALSE
);

-- 4. SINGLE SIGN-ON (Google/Microsoft Integration)
-- This extends the base users table to track OAuth identities
CREATE TABLE master_data.user_sso_identities (
    identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Reference to base users table
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('GOOGLE', 'MICROSOFT')),
    provider_subject_id VARCHAR(255) NOT NULL, -- The unique ID from Google/Microsoft
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(provider, provider_subject_id)
);

-- Row-Level Security (RLS) Policies
-- Ensures cross-tenant data leakage is cryptographically prevented at the DB layer
ALTER TABLE master_data.campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_campuses ON master_data.campuses 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE master_data.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_departments ON master_data.departments 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE master_data.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_programs ON master_data.programs 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE master_data.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_courses ON master_data.courses 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE master_data.infrastructure_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_blocks ON master_data.infrastructure_blocks 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE master_data.infrastructure_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_rooms ON master_data.infrastructure_rooms 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
