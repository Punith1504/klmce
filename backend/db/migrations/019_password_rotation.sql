-- Migration: Add password rotation tracking
ALTER TABLE erp_core.users ADD COLUMN password_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
