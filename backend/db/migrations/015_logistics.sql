-- Migration: IoT & Campus Operational Logistics

CREATE SCHEMA IF NOT EXISTS logistics;

-- ==========================================
-- Hostel & Infrastructure Topologies
-- ==========================================
CREATE TABLE logistics.hostel_rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_name VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    ac_enabled BOOLEAN DEFAULT FALSE,
    UNIQUE(block_name, room_number)
);

CREATE TABLE logistics.room_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES logistics.hostel_rooms(room_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PROVISIONAL' CHECK (status IN ('PREFERENCE', 'PROVISIONAL', 'CONFIRMED', 'EVICTED')),
    mess_plan VARCHAR(50) CHECK (mess_plan IN ('NORTH_INDIAN', 'SOUTH_INDIAN', 'CONTINENTAL', 'NONE')),
    UNIQUE(student_id)
);

CREATE TABLE logistics.maintenance_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    room_id UUID REFERENCES logistics.hostel_rooms(room_id),
    issue_category VARCHAR(50) CHECK (issue_category IN ('PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'INTERNET', 'HOUSEKEEPING')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Canteen Telemetry & Fleet Transit
-- ==========================================
CREATE TABLE logistics.canteen_telemetry (
    scan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')),
    scan_timestamp TIMESTAMPTZ DEFAULT NOW(),
    consumed BOOLEAN DEFAULT TRUE,
    food_wastage_grams INT DEFAULT 0
);

CREATE TABLE logistics.transit_routes (
    route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    total_seats INT NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20)
);

CREATE TABLE logistics.transit_stops (
    stop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES logistics.transit_routes(route_id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    transport_fee DECIMAL(10, 2) NOT NULL,
    sequence_order INT NOT NULL
);
