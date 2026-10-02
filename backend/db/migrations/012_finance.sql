-- Migration: FinTech Student Finance & Billing Engine

CREATE SCHEMA IF NOT EXISTS finance;

CREATE TABLE finance.fee_structures (
    structure_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    batch_year INT NOT NULL,
    quota VARCHAR(50) NOT NULL,
    tuition_fee DECIMAL(12, 2) NOT NULL,
    development_fee DECIMAL(12, 2) NOT NULL,
    caution_deposit DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, batch_year, quota)
);

CREATE TABLE finance.student_ledgers (
    ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    sub_account VARCHAR(50) NOT NULL CHECK (sub_account IN ('ACADEMIC', 'HOSTEL', 'TRANSPORT', 'MISC')),
    
    -- Real-time Aggregate Math
    total_billed DECIMAL(12, 2) DEFAULT 0.00,
    total_paid DECIMAL(12, 2) DEFAULT 0.00,
    total_waivers DECIMAL(12, 2) DEFAULT 0.00,
    -- Computed business logic: Outstanding Balance = total_billed - (total_paid + total_waivers)
    
    UNIQUE(student_id, sub_account)
);

CREATE TABLE finance.fee_installments (
    installment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_id UUID REFERENCES finance.student_ledgers(ledger_id) ON DELETE CASCADE,
    amount_due DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    late_fee_per_day DECIMAL(10, 2) DEFAULT 0.00, -- Dynamic compounding penalty rate
    status VARCHAR(20) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID'))
);

CREATE TABLE finance.transactions (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_id UUID REFERENCES finance.student_ledgers(ledger_id),
    amount DECIMAL(12, 2) NOT NULL,
    txn_type VARCHAR(20) CHECK (txn_type IN ('CREDIT', 'DEBIT', 'WAIVER', 'PENALTY')),
    payment_mode VARCHAR(50) CHECK (payment_mode IN ('ONLINE_GATEWAY', 'NEFT', 'DD', 'CHALLAN', 'SYSTEM')),
    
    gateway_provider VARCHAR(50), -- CCAvenue, Razorpay, BillDesk, etc.
    reference_id VARCHAR(255),
    
    -- Offline Maker-Checker Approval Workflow
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING_APPROVAL', 'COMPLETED', 'REJECTED', 'FAILED')),
    maker_admin_id UUID,
    checker_admin_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
