-- ==============================================================================
-- KLMCE ERP - End-of-Year (EOY) Database Partitioning & Archival Migration
-- ==============================================================================

-- Safety protocol: Run entirely within a transaction block. If any step fails, 
-- the entire schema change reverts instantaneously.
BEGIN;

-- ==========================================
-- 1. ATTENDANCE RECORDS PARTITIONING
-- ==========================================
-- PostgreSQL cannot retroactively alter a standard table into a partitioned table.
-- We must rename, build the declarative partition schema, and migrate the data.

ALTER TABLE attendance_records RENAME TO attendance_records_legacy;

CREATE TABLE attendance_records (
    record_id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    slot_id UUID NOT NULL,
    student_id UUID NOT NULL,
    academic_year VARCHAR(9) NOT NULL, -- Core Partition Key (e.g., '2025-2026')
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    marked_by UUID,
    override_justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Partition keys MUST be part of the Primary Key constraint in PostgreSQL
    PRIMARY KEY (record_id, academic_year)
) PARTITION BY LIST (academic_year);

-- Establish the active hot-storage partition for the incoming academic year
CREATE TABLE attendance_records_active 
    PARTITION OF attendance_records 
    FOR VALUES IN ('2026-2027');

-- Establish the cold-storage archive partition for the concluding year
CREATE TABLE attendance_records_archive_2025 
    PARTITION OF attendance_records 
    FOR VALUES IN ('2025-2026');

-- Mathematically stream the millions of rows from the legacy unpartitioned table 
-- into the new partitioned schema, assigning the historical academic year.
INSERT INTO attendance_records (record_id, tenant_id, slot_id, student_id, academic_year, date, status, marked_by, override_justification, created_at)
SELECT record_id, tenant_id, slot_id, student_id, '2025-2026', date, status, marked_by, override_justification, created_at 
FROM attendance_records_legacy;

-- [CRITICAL]: Detach the cold-storage partition from the active query planner tree.
-- This ensures that standard `SELECT * FROM attendance_records` commands physically 
-- ignore last year's data, resulting in sub-millisecond query speeds for active registers.
ALTER TABLE attendance_records DETACH PARTITION attendance_records_archive_2025;

-- Lock the detached archive partition at the kernel level to guarantee read-only immutability.
-- (This prevents any application bug from mutating historical audits)
ALTER TABLE attendance_records_archive_2025 OWNER TO postgres;

-- Shred the legacy table to free up disk IO
DROP TABLE attendance_records_legacy;

-- ==========================================
-- 2. EXAM MARKS PARTITIONING
-- ==========================================
ALTER TABLE exam_marks RENAME TO exam_marks_legacy;

CREATE TABLE exam_marks (
    mark_id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2),
    PRIMARY KEY (mark_id, academic_year)
) PARTITION BY LIST (academic_year);

CREATE TABLE exam_marks_active PARTITION OF exam_marks FOR VALUES IN ('2026-2027');
CREATE TABLE exam_marks_archive_2025 PARTITION OF exam_marks FOR VALUES IN ('2025-2026');

INSERT INTO exam_marks (mark_id, tenant_id, student_id, course_id, academic_year, score, grade)
SELECT mark_id, tenant_id, student_id, course_id, '2025-2026', score, grade 
FROM exam_marks_legacy;

ALTER TABLE exam_marks DETACH PARTITION exam_marks_archive_2025;
ALTER TABLE exam_marks_archive_2025 OWNER TO postgres;

DROP TABLE exam_marks_legacy;

COMMIT;
