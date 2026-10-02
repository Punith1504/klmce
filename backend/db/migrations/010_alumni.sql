-- Migration: Alumni Relations & Endowment Management

CREATE SCHEMA IF NOT EXISTS alumni;

CREATE TABLE alumni.profiles (
    alumni_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    graduation_year INT NOT NULL,
    industry_domain VARCHAR(255),
    current_employer VARCHAR(255),
    years_of_experience INT,
    mentorship_available BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE alumni.endowment_campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_raised DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED'))
);

CREATE TABLE alumni.donations (
    donation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES alumni.endowment_campaigns(campaign_id),
    alumni_id UUID REFERENCES alumni.profiles(alumni_id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_gateway_ref VARCHAR(255) NOT NULL UNIQUE, -- Stripe Charge ID / Razorpay Payment ID
    is_recurring BOOLEAN DEFAULT FALSE,
    tax_receipt_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alumni.mentorship_matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id UUID REFERENCES alumni.profiles(alumni_id) ON DELETE CASCADE,
    student_id UUID NOT NULL, -- Logical foreign key mapping to academics.student_profiles
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumni_id, student_id)
);

CREATE TABLE alumni.masked_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES alumni.mentorship_matches(match_id) ON DELETE CASCADE,
    sender_type VARCHAR(20) CHECK (sender_type IN ('ALUMNI', 'STUDENT')),
    encrypted_payload TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
