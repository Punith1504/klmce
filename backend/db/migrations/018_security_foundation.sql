-- Supported core upgrade after init_schema.sql and 001_master_data.sql.
-- Does not run the incompatible legacy partitioning script or enable unfinished modules.
BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_subject text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD CONSTRAINT users_tenant_identity UNIQUE (tenant_id,user_id);
CREATE TABLE sections (
 section_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL REFERENCES tenants,
 name text NOT NULL, UNIQUE(tenant_id,section_id), UNIQUE(tenant_id,name)
);
ALTER TABLE students ADD COLUMN user_id uuid UNIQUE;
ALTER TABLE students ADD COLUMN section_id uuid;
ALTER TABLE students ADD CONSTRAINT student_tenant_identity UNIQUE(tenant_id,student_id);
ALTER TABLE students ADD CONSTRAINT student_user_tenant FOREIGN KEY(tenant_id,user_id) REFERENCES users(tenant_id,user_id);
ALTER TABLE students ADD CONSTRAINT student_parent_tenant FOREIGN KEY(tenant_id,parent_id) REFERENCES users(tenant_id,user_id);
ALTER TABLE students ADD CONSTRAINT student_section_tenant FOREIGN KEY(tenant_id,section_id) REFERENCES sections(tenant_id,section_id);
ALTER TABLE master_data.courses ADD CONSTRAINT course_tenant_identity UNIQUE(tenant_id,course_id);
ALTER TABLE timetable_slots ADD CONSTRAINT slot_tenant_identity UNIQUE(tenant_id,slot_id);
ALTER TABLE timetable_slots ADD CONSTRAINT slot_section_tenant FOREIGN KEY(tenant_id,section_id) REFERENCES sections(tenant_id,section_id);
ALTER TABLE timetable_slots ADD CONSTRAINT slot_faculty_tenant FOREIGN KEY(tenant_id,faculty_id) REFERENCES users(tenant_id,user_id);
ALTER TABLE timetable_slots ADD CONSTRAINT slot_course_tenant FOREIGN KEY(tenant_id,course_id) REFERENCES master_data.courses(tenant_id,course_id);
ALTER TABLE timetable_slots ADD CONSTRAINT prevent_section_overlap EXCLUDE USING gist
 (tenant_id WITH =, section_id WITH =, day_of_week WITH =, timerange(start_time,end_time) WITH &&);
ALTER TABLE attendance_records ADD COLUMN slot_id uuid;
ALTER TABLE attendance_records ADD COLUMN marked_by uuid;
ALTER TABLE attendance_records ADD COLUMN override_justification text;
ALTER TABLE attendance_records ADD CONSTRAINT attendance_student_tenant FOREIGN KEY(tenant_id,student_id) REFERENCES students(tenant_id,student_id);
ALTER TABLE attendance_records ADD CONSTRAINT attendance_slot_tenant FOREIGN KEY(tenant_id,slot_id) REFERENCES timetable_slots(tenant_id,slot_id);
ALTER TABLE attendance_records ADD CONSTRAINT attendance_actor_tenant FOREIGN KEY(tenant_id,marked_by) REFERENCES users(tenant_id,user_id);
ALTER TABLE attendance_records ADD CONSTRAINT attendance_once UNIQUE(tenant_id,student_id,slot_id,date);
CREATE INDEX attendance_history ON attendance_records(tenant_id,student_id,date DESC);
ALTER TABLE exam_marks ADD COLUMN faculty_id uuid;
ALTER TABLE exam_marks ADD COLUMN status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK(status IN('DRAFT','SUBMITTED','LOCKED','PUBLISHED'));
ALTER TABLE exam_marks ADD COLUMN revision_window_until timestamptz;
ALTER TABLE exam_marks ADD CONSTRAINT exam_mark_bounds CHECK(max_marks>0 AND marks_obtained>=0 AND marks_obtained<=max_marks);
ALTER TABLE exam_marks ADD CONSTRAINT exam_tenant_identity UNIQUE(tenant_id,mark_id);
ALTER TABLE exam_marks ADD CONSTRAINT exam_student_tenant FOREIGN KEY(tenant_id,student_id) REFERENCES students(tenant_id,student_id);
ALTER TABLE exam_marks ADD CONSTRAINT exam_faculty_tenant FOREIGN KEY(tenant_id,faculty_id) REFERENCES users(tenant_id,user_id);
CREATE TABLE exam_change_requests (
 request_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL,
 mark_id uuid NOT NULL, requested_by uuid NOT NULL, reason text NOT NULL CHECK(length(trim(reason))>=10),
 status varchar(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN('PENDING','APPROVED','REJECTED')),
 admin_signatures uuid[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,mark_id) REFERENCES exam_marks(tenant_id,mark_id),
 FOREIGN KEY(tenant_id,requested_by) REFERENCES users(tenant_id,user_id)
);
CREATE TRIGGER audit_exam_change AFTER INSERT OR UPDATE OR DELETE ON exam_change_requests
 FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('request_id');
ALTER FUNCTION audit_trigger_func() SET search_path=public,pg_temp;

CREATE FUNCTION erp_identity(kind text, identity text)
RETURNS TABLE(user_id uuid,tenant_id uuid,role varchar,is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT u.user_id,u.tenant_id,u.role,u.is_active FROM users u
 WHERE (kind='external_subject' AND u.external_subject=identity)
 OR (kind='user_id' AND u.user_id::text=identity)
$$;
CREATE FUNCTION erp_login(tenant uuid, login_email text)
RETURNS TABLE(user_id uuid,tenant_id uuid,role varchar,is_active boolean,password_hash varchar,mfa_secret varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT u.user_id,u.tenant_id,u.role,u.is_active,u.password_hash,u.mfa_secret FROM users u
 WHERE u.tenant_id=tenant AND lower(u.email)=login_email
$$;
CREATE UNIQUE INDEX users_normalized_email ON users(tenant_id,lower(email));
REVOKE ALL ON FUNCTION erp_identity(text,text),erp_login(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION erp_identity(text,text),erp_login(uuid,text) TO app_user;

CREATE FUNCTION erp_visible_student(target uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT EXISTS(SELECT 1 FROM students s WHERE s.student_id=target
 AND s.tenant_id=nullif(current_setting('app.current_tenant_id',true),'')::uuid AND (
 current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN','FINANCE')
 OR (current_setting('app.current_user_role',true)='STUDENT' AND s.user_id=nullif(current_setting('app.current_user_id',true),'')::uuid)
 OR (current_setting('app.current_user_role',true)='PARENT' AND s.parent_id=nullif(current_setting('app.current_user_id',true),'')::uuid)
 OR (current_setting('app.current_user_role',true)='FACULTY' AND EXISTS(SELECT 1 FROM timetable_slots t
 WHERE t.tenant_id=s.tenant_id AND t.section_id=s.section_id AND t.faculty_id=nullif(current_setting('app.current_user_id',true),'')::uuid))))
$$;
REVOKE ALL ON FUNCTION erp_visible_student(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION erp_visible_student(uuid) TO app_user;
CREATE POLICY students_record_scope ON students AS RESTRICTIVE FOR SELECT USING(erp_visible_student(student_id));
CREATE POLICY attendance_record_scope ON attendance_records AS RESTRICTIVE FOR ALL USING(erp_visible_student(student_id));
CREATE POLICY exam_record_scope ON exam_marks AS RESTRICTIVE FOR ALL USING(erp_visible_student(student_id));
CREATE POLICY fee_record_scope ON fee_transactions AS RESTRICTIVE FOR SELECT USING(erp_visible_student(student_id));
CREATE POLICY students_write_scope ON students AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
CREATE POLICY students_update_scope ON students AS RESTRICTIVE FOR UPDATE USING(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
CREATE POLICY timetable_write_scope ON timetable_slots AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
CREATE POLICY exam_write_scope ON exam_marks AS RESTRICTIVE FOR UPDATE USING(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN','FACULTY'));
CREATE POLICY attendance_insert_scope ON attendance_records AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('FACULTY','STUDENT'));
CREATE POLICY attendance_update_scope ON attendance_records AS RESTRICTIVE FOR UPDATE USING(current_setting('app.current_user_role',true)='INSTITUTION_ADMIN');
DO $$ DECLARE tab text; BEGIN
 FOREACH tab IN ARRAY ARRAY['sections','exam_change_requests'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',tab);
 EXECUTE format('CREATE POLICY tenant_scope ON %I USING (tenant_id=nullif(current_setting(''app.current_tenant_id'',true),'''')::uuid)',tab);
 END LOOP;
 FOREACH tab IN ARRAY ARRAY['students','attendance_records','exam_marks','fee_transactions','timetable_slots','sections','exam_change_requests'] LOOP
 EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',tab);
 END LOOP;
END $$;
GRANT USAGE ON SCHEMA public,master_data TO app_user;
GRANT SELECT ON students,attendance_records,exam_marks,fee_transactions,timetable_slots,sections,exam_change_requests,master_data.courses TO app_user;
GRANT SELECT(user_id,tenant_id,role,first_name,last_name,is_active) ON users TO app_user;
GRANT INSERT ON students,attendance_records,timetable_slots,exam_change_requests TO app_user;
GRANT UPDATE ON attendance_records,exam_marks,exam_change_requests TO app_user;
REVOKE ALL ON audit_logs FROM app_user;

-- Immutable postings. Payment posting remains disabled until the real provider
-- contract/invoice model is implemented and validated with integration tests.
CREATE FUNCTION reject_fee_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Fee transactions are append-only'; END $$;
CREATE TRIGGER immutable_fee_transactions BEFORE UPDATE OR DELETE ON fee_transactions
 FOR EACH ROW EXECUTE FUNCTION reject_fee_mutation();
CREATE POLICY exam_publication_scope ON exam_marks AS RESTRICTIVE FOR SELECT USING (current_setting('app.current_user_role',true) NOT IN ('STUDENT','PARENT') OR status='PUBLISHED');
COMMIT;
