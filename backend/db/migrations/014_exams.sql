-- Migration: Examination Operations & Masking Engine

CREATE SCHEMA IF NOT EXISTS exams;

CREATE TABLE exams.schedules (
    exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL, -- Logical FK to obe.courses
    exam_type VARCHAR(50) CHECK (exam_type IN ('REGULAR', 'MAKEUP', 'RE_EXAM')),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED'
);

CREATE TABLE exams.eligibility (
    eligibility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams.schedules(exam_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL,
    fees_cleared BOOLEAN DEFAULT FALSE,
    is_eligible BOOLEAN DEFAULT FALSE,
    hall_ticket_generated BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_id, student_id)
);

CREATE TABLE exams.seating_arrangements (
    seating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams.schedules(exam_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    desk_number VARCHAR(20) NOT NULL,
    UNIQUE(exam_id, student_id), -- One student per exam
    UNIQUE(exam_id, room_number, desk_number) -- One student per physical desk
);

CREATE TABLE exams.evaluations (
    evaluation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams.schedules(exam_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    masked_dummy_number VARCHAR(100) UNIQUE NOT NULL, -- Physical barcode printed on answer sheets
    evaluator_id UUID,
    raw_marks DECIMAL(5,2),
    grace_marks DECIMAL(5,2) DEFAULT 0.00,
    penalty_marks DECIMAL(5,2) DEFAULT 0.00,
    is_demasked BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_id, student_id)
);

CREATE TABLE exams.certificates (
    certificate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    certificate_type VARCHAR(50) NOT NULL, -- 'PROVISIONAL_DEGREE', 'CONSOLIDATED_MARKSHEET'
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    issued_date DATE DEFAULT CURRENT_DATE,
    verification_hash VARCHAR(255) UNIQUE NOT NULL
);
