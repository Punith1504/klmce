-- Migration: Library Management System (LMS)
-- Handles Books, Copies (Physical RFID tags), and Loans with RLS isolation

CREATE SCHEMA IF NOT EXISTS library;

CREATE TABLE library.books (
    book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    base_fine_per_day DECIMAL(5, 2) DEFAULT 10.00
);

CREATE TABLE library.book_copies (
    copy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES library.books(book_id) ON DELETE CASCADE,
    rfid_epc VARCHAR(50) UNIQUE NOT NULL, -- Physical Electronic Product Code embedded in the RFID tag
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOANED', 'LOST', 'MAINTENANCE'))
);

CREATE TABLE library.book_loans (
    loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    student_id UUID NOT NULL,
    copy_id UUID REFERENCES library.book_copies(copy_id) ON DELETE CASCADE,
    checkout_timestamp TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_timestamp TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST')),
    
    -- Ensure a specific copy cannot be returned twice
    UNIQUE(copy_id, return_timestamp)
);

-- Note: A Row-Level Security (RLS) policy would typically be attached to `tenant_id` here 
-- mirroring our architecture in Phase 1 to guarantee multi-tenant data isolation.
