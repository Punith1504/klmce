-- Migration: Outcome-Based Education (OBE) & CBCS LMS Engine

CREATE SCHEMA IF NOT EXISTS obe;

CREATE TABLE obe.courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    capacity INT NOT NULL, -- Strict hardware seat limits
    term_type VARCHAR(20) CHECK (term_type IN ('SEMESTER', 'TRIMESTER', 'YEARLY')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE obe.course_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES obe.courses(course_id) ON DELETE CASCADE,
    student_id UUID NOT NULL, -- Logical foreign key mapping to academics.student_profiles
    status VARCHAR(20) DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'WAITLISTED', 'DROPPED')),
    enrollment_timestamp TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

CREATE TABLE obe.outcomes_mapping (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES obe.courses(course_id) ON DELETE CASCADE,
    course_outcome VARCHAR(50) NOT NULL, -- e.g., 'CO1'
    program_outcome VARCHAR(50) NOT NULL, -- e.g., 'PO1', 'PO2'
    blooms_taxonomy_level INT CHECK (blooms_taxonomy_level BETWEEN 1 AND 6), -- 1: Remember ... 6: Create
    weightage DECIMAL(3, 2) DEFAULT 1.00,
    UNIQUE(course_id, course_outcome, program_outcome)
);

CREATE TABLE obe.question_bank (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES obe.courses(course_id) ON DELETE CASCADE,
    question_type VARCHAR(50) CHECK (question_type IN ('MCQ', 'SHORT_ANSWER', 'MATCHING', 'EQUATION')),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    course_outcome VARCHAR(50), -- Binds the question directly to outcomes_mapping
    blooms_taxonomy_level INT CHECK (blooms_taxonomy_level BETWEEN 1 AND 6),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD'))
);

CREATE TABLE obe.assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES obe.courses(course_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    release_date TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    turnitin_enabled BOOLEAN DEFAULT FALSE,
    rubric_json JSONB
);

CREATE TABLE obe.assignment_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES obe.assignments(assignment_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    s3_document_key VARCHAR(512),
    turnitin_similarity_score DECIMAL(5, 2), -- Plagiarism integrity metric
    grading_score DECIMAL(5, 2),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);
