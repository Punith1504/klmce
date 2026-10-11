-- 1. Fix DELETE privilege vulnerability
-- Prevent the application role from hard-deleting critical records
REVOKE DELETE ON students FROM app_user;
-- Revoke from erp_app just in case the test environment doesn't strictly match the production role
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'erp_app') THEN
    EXECUTE 'REVOKE DELETE ON students FROM erp_app';
  END IF;
END
$$;

-- 2. Restore missing RLS policies on partitioned tables (dropped by eoy_partitioning.sql)
ALTER TABLE exam_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_tenant_exam_marks ON exam_marks
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_tenant_attendance ON attendance_records
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID);

-- 3. Restore missing audit triggers on partitioned tables (dropped by eoy_partitioning.sql)
CREATE TRIGGER audit_exam_marks_trigger
AFTER INSERT OR UPDATE OR DELETE ON exam_marks
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('mark_id');

CREATE TRIGGER audit_attendance_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('record_id');

-- 4. Fix Authentication RLS bypass for login
-- Create a SECURITY DEFINER function so that the auth router can verify credentials 
-- before it knows the tenant_id to set in the session.
CREATE OR REPLACE FUNCTION get_user_for_login(p_login_id VARCHAR)
RETURNS TABLE (
    user_id UUID, 
    tenant_id UUID, 
    role VARCHAR, 
    password_hash VARCHAR, 
    mfa_secret VARCHAR, 
    phone_number VARCHAR, 
    password_updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY 
    SELECT u.user_id, u.tenant_id, u.role, u.password_hash, u.mfa_secret, u.phone_number, u.password_updated_at
    FROM users u 
    WHERE u.login_id = p_login_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
