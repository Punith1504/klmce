-- ==============================================================================
-- PHASE 4: LEARNING MANAGEMENT SYSTEM (LMS)
-- Requirements: Assignment Submissions, Deadlines, & Plagiarism Metadata
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS lms;

CREATE TABLE lms.course_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    course_id UUID NOT NULL, -- References master_data.courses
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    allow_late_submissions BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms.assignment_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    assignment_id UUID REFERENCES lms.course_assignments(assignment_id),
    student_id UUID NOT NULL, -- References global users table
    s3_file_key VARCHAR(512) NOT NULL,
    file_mime_type VARCHAR(100) NOT NULL,
    submission_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ON_TIME', 'LATE', 'REJECTED')),
    document_sha256 VARCHAR(64), -- Computed asynchronously by Celery
    is_duplicate BOOLEAN DEFAULT FALSE,
    
    -- Ensure a student can only have one active submission record per assignment
    UNIQUE(assignment_id, student_id)
);

-- Ensure strict multi-tenant isolation via Row-Level Security
ALTER TABLE lms.course_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolate_tenant_assignments ON lms.course_assignments 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE lms.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolate_tenant_submissions ON lms.assignment_submissions 
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
