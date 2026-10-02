-- Migration: Social Platform, E-Notices & Workflow Automation

CREATE SCHEMA IF NOT EXISTS social;

-- ==========================================
-- Automated Gate Pass & IoT Security
-- ==========================================
CREATE TABLE social.gate_passes (
    pass_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    pass_type VARCHAR(20) CHECK (pass_type IN ('DAY_OUT', 'NIGHT_OUT', 'EMERGENCY')),
    reason TEXT NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,
    expected_return_time TIMESTAMPTZ NOT NULL,
    
    parent_approval_status VARCHAR(20) DEFAULT 'NOT_REQUIRED' CHECK (parent_approval_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')),
    warden_approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (warden_approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    
    -- Hardware IoT Lifecycle Tracking
    actual_exit_time TIMESTAMPTZ,
    actual_return_time TIMESTAMPTZ,
    is_breached BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Campus Social Feed
-- ==========================================
CREATE TABLE social.feed_posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    cohort_id UUID, -- Granular visibility restrictions (e.g., specific class or branch)
    content TEXT NOT NULL,
    media_s3_keys JSONB,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social.feed_comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social.feed_posts(post_id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- E-Notices & Mandatory Receipts
-- ==========================================
CREATE TABLE social.enotices (
    notice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issuer_admin_id UUID NOT NULL,
    target_booth VARCHAR(100) NOT NULL, -- Logical groupings: e.g., 'ALL_BTECH_CSE', 'HOSTEL_BLOCK_A'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social.enotice_receipts (
    receipt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES social.enotices(notice_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notice_id, student_id) -- Ensures a student can only acknowledge once
);
