-- Migration: Hostel & Residential Life Constraints
-- Focuses on preventing double-booking and tracking biometrics

CREATE SCHEMA IF NOT EXISTS residential;

CREATE TABLE residential.hostel_blocks (
    block_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    block_name VARCHAR(100) NOT NULL,
    gender_restriction VARCHAR(10) CHECK (gender_restriction IN ('MALE', 'FEMALE', 'MIXED'))
);

CREATE TABLE residential.rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID REFERENCES residential.hostel_blocks(block_id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    base_fee DECIMAL(10, 2) NOT NULL
);

CREATE TABLE residential.beds (
    bed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES residential.rooms(room_id) ON DELETE CASCADE,
    bed_code VARCHAR(10) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    UNIQUE(room_id, bed_code)
);

CREATE TABLE residential.room_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    student_id UUID NOT NULL,
    bed_id UUID NOT NULL REFERENCES residential.beds(bed_id),
    allocated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VACATED', 'EVICTED')),
    
    -- MATHEMATICAL DOUBLE-BOOKING PREVENTION
    -- A bed can only have ONE active allocation at any given time.
    EXCLUDE USING gist (bed_id WITH =) WHERE (status = 'ACTIVE')
);

CREATE TABLE residential.night_out_passes (
    pass_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    requested_departure TIMESTAMPTZ NOT NULL,
    requested_return TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    parent_approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (parent_approval_status IN ('PENDING', 'APPROVED', 'DENIED')),
    warden_approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (warden_approval_status IN ('PENDING', 'APPROVED', 'DENIED')),
    parent_magic_token VARCHAR(255) UNIQUE
);

CREATE TABLE residential.turnstile_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    hardware_id VARCHAR(50) NOT NULL,
    scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    direction VARCHAR(10) CHECK (direction IN ('IN', 'OUT'))
);
