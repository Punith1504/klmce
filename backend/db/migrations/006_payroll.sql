-- Migration: FinTech Payroll & Compensation Engine

CREATE SCHEMA IF NOT EXISTS payroll;

CREATE TABLE payroll.faculty_compensation (
    faculty_id UUID PRIMARY KEY,
    annual_base_pay DECIMAL(12, 2) NOT NULL CHECK (annual_base_pay > 0),
    pf_opt_in BOOLEAN DEFAULT TRUE,
    bank_account_number VARCHAR(50) NOT NULL,
    bank_routing_code VARCHAR(20) NOT NULL -- IFSC or ABA Routing Number
);

CREATE TABLE payroll.salary_registers (
    register_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    payroll_month DATE NOT NULL, -- Evaluated on the 1st of the month (e.g., '2026-10-01')
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'DISBURSED')),
    total_disbursement DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    UNIQUE(tenant_id, payroll_month)
);

CREATE TABLE payroll.salary_slips (
    slip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID REFERENCES payroll.salary_registers(register_id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES payroll.faculty_compensation(faculty_id),
    
    -- Attendance Metrics (Derived from IoT Biometrics)
    total_working_days INT NOT NULL,
    present_days INT NOT NULL,
    paid_leaves INT NOT NULL,
    unpaid_leaves INT NOT NULL,
    billable_days INT NOT NULL,
    
    -- Gross Earnings
    base_pay DECIMAL(10, 2) NOT NULL,
    hra DECIMAL(10, 2) NOT NULL,
    transport_allowance DECIMAL(10, 2) NOT NULL,
    gross_earnings DECIMAL(10, 2) NOT NULL,
    
    -- Tax Deductions & Compliance
    provident_fund DECIMAL(10, 2) NOT NULL,
    professional_tax DECIMAL(10, 2) NOT NULL,
    tds_income_tax DECIMAL(10, 2) NOT NULL,
    total_deductions DECIMAL(10, 2) NOT NULL,
    
    -- Final Disbursement
    net_payable DECIMAL(10, 2) NOT NULL,
    
    UNIQUE(register_id, faculty_id)
);
