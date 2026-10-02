-- Migration: Community Engagement & Asset Tracking

CREATE SCHEMA IF NOT EXISTS community;

-- ==========================================
-- Venues & Event Management
-- ==========================================
CREATE TABLE community.venues (
    venue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    is_bookable BOOLEAN DEFAULT TRUE,
    amenities JSONB -- Extensible list: ["PROJECTOR", "PA_SYSTEM", "AC"]
);

CREATE TABLE community.events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    venue_id UUID REFERENCES community.venues(venue_id),
    cover_image_s3_key VARCHAR(512),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    seat_capacity INT NOT NULL,
    public_registration_url VARCHAR(512) UNIQUE,
    guest_speakers JSONB,
    status VARCHAR(50) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE community.event_registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES community.events(event_id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL, -- Maps to Student, Faculty, or External profiles
    is_checked_in BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMPTZ,
    UNIQUE(event_id, attendee_id)
);

-- ==========================================
-- Enterprise Asset Lifecycle Management
-- ==========================================
CREATE TABLE community.assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag VARCHAR(100) UNIQUE NOT NULL, -- Physical Barcode/RFID tag affixed to hardware
    category VARCHAR(50) CHECK (category IN ('IT_HARDWARE', 'FURNITURE', 'LAB_EQUIPMENT', 'VEHICLE')),
    specifications JSONB,
    purchase_order_id VARCHAR(100),
    department_id UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'RETIRED')),
    insurance_policy_no VARCHAR(100),
    acquired_date DATE DEFAULT CURRENT_DATE
);

-- ==========================================
-- Surveys & Mentorship
-- ==========================================
CREATE TABLE community.surveys (
    survey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    survey_type VARCHAR(50) CHECK (survey_type IN ('FACULTY_EVAL', 'EXIT_SURVEY', 'STUDENT_SATISFACTION')),
    form_schema JSONB NOT NULL, -- Defines the dynamic questionnaire structure
    is_active BOOLEAN DEFAULT TRUE,
    target_role VARCHAR(50) NOT NULL
);

CREATE TABLE community.survey_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES community.surveys(survey_id) ON DELETE CASCADE,
    responder_id UUID NOT NULL,
    response_data JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(survey_id, responder_id) -- One response per user per survey
);

CREATE TABLE community.mentorship (
    mentorship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_faculty_id UUID NOT NULL,
    mentee_student_id UUID NOT NULL,
    UNIQUE(mentor_faculty_id, mentee_student_id)
);
