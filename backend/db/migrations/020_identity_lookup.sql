-- Keep the UUID column indexable. Casting every user_id to text forced a
-- full users-table scan on every authenticated request.
CREATE OR REPLACE FUNCTION erp_identity(kind text, identity text)
RETURNS TABLE(user_id uuid,tenant_id uuid,role varchar,is_active boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF kind='user_id' THEN
  RETURN QUERY SELECT u.user_id,u.tenant_id,u.role,u.is_active FROM users u WHERE u.user_id=identity::uuid;
 ELSIF kind='external_subject' THEN
  RETURN QUERY SELECT u.user_id,u.tenant_id,u.role,u.is_active FROM users u WHERE u.external_subject=identity;
 END IF;
END $$;
CREATE INDEX students_parent_lookup ON students(tenant_id,parent_id,student_id);
