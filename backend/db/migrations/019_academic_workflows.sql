-- Incremental upgrade: preserve checksums of prior migrations.
CREATE TABLE exam_schedules (
 schedule_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL REFERENCES tenants,
 section_id uuid NOT NULL, course_id uuid NOT NULL, faculty_id uuid NOT NULL,
 created_by uuid NOT NULL, name varchar(100) NOT NULL, exam_date date NOT NULL,
 max_marks numeric(5,2) NOT NULL CHECK(max_marks>0 AND max_marks<=999.99),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,schedule_id), UNIQUE(tenant_id,section_id,course_id,name,exam_date),
 FOREIGN KEY(tenant_id,section_id) REFERENCES sections(tenant_id,section_id),
 FOREIGN KEY(tenant_id,course_id) REFERENCES master_data.courses(tenant_id,course_id),
 FOREIGN KEY(tenant_id,faculty_id) REFERENCES users(tenant_id,user_id),
 FOREIGN KEY(tenant_id,created_by) REFERENCES users(tenant_id,user_id)
);
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules FORCE ROW LEVEL SECURITY;
CREATE POLICY exam_schedule_tenant ON exam_schedules USING(tenant_id=nullif(current_setting('app.current_tenant_id',true),'')::uuid);
CREATE POLICY exam_schedule_roles ON exam_schedules AS RESTRICTIVE FOR ALL USING(
 current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN')
 OR (current_setting('app.current_user_role',true)='FACULTY' AND faculty_id=nullif(current_setting('app.current_user_id',true),'')::uuid));
CREATE POLICY exam_schedule_insert ON exam_schedules AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
GRANT SELECT,INSERT ON exam_schedules TO app_user;
GRANT UPDATE(schedule_id) ON exam_schedules TO app_user; -- row locking only
CREATE TRIGGER audit_exam_schedule AFTER INSERT OR UPDATE OR DELETE ON exam_schedules FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('schedule_id');
ALTER TABLE exam_marks ADD COLUMN schedule_id uuid;
ALTER TABLE exam_marks ADD COLUMN is_entered boolean NOT NULL DEFAULT true;
ALTER TABLE exam_marks ADD CONSTRAINT mark_schedule_tenant FOREIGN KEY(tenant_id,schedule_id) REFERENCES exam_schedules(tenant_id,schedule_id);
ALTER TABLE exam_marks ADD CONSTRAINT mark_schedule_student UNIQUE(schedule_id,student_id);
GRANT INSERT ON exam_marks TO app_user;
CREATE POLICY exam_insert_admin ON exam_marks AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
CREATE INDEX exam_history ON exam_marks(tenant_id,student_id,exam_date DESC);
CREATE INDEX fee_history ON fee_transactions(tenant_id,student_id,transaction_date DESC);
GRANT INSERT ON sections,master_data.courses TO app_user;
CREATE POLICY section_insert_admin ON sections AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
CREATE POLICY course_insert_admin ON master_data.courses AS RESTRICTIVE FOR INSERT WITH CHECK(current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN'));
CREATE UNIQUE INDEX course_code_unique ON master_data.courses(tenant_id,course_code);
CREATE TRIGGER audit_section AFTER INSERT OR UPDATE OR DELETE ON sections FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('section_id');
CREATE TRIGGER audit_course AFTER INSERT OR UPDATE OR DELETE ON master_data.courses FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('course_id');

-- Evaluate student/parent ownership once per statement, not by invoking a
-- SECURITY DEFINER function separately for every returned history row.
DROP POLICY attendance_record_scope ON attendance_records;
DROP POLICY exam_record_scope ON exam_marks;
DROP POLICY fee_record_scope ON fee_transactions;
DO $$ DECLARE tab text; pol text; BEGIN
 FOREACH tab IN ARRAY ARRAY['attendance_records','exam_marks','fee_transactions'] LOOP
 pol=CASE tab WHEN 'attendance_records' THEN 'attendance_record_scope' WHEN 'exam_marks' THEN 'exam_record_scope' ELSE 'fee_record_scope' END;
 EXECUTE format($policy$
 CREATE POLICY %I ON %I AS RESTRICTIVE FOR ALL USING (
 CASE current_setting('app.current_user_role',true)
 WHEN 'STUDENT' THEN student_id IN (SELECT student_id FROM students WHERE user_id=nullif(current_setting('app.current_user_id',true),'')::uuid)
 WHEN 'PARENT' THEN student_id IN (SELECT student_id FROM students WHERE parent_id=nullif(current_setting('app.current_user_id',true),'')::uuid)
 WHEN 'FACULTY' THEN student_id IN (SELECT student_id FROM students)
 WHEN 'SUPER_ADMIN' THEN true WHEN 'INSTITUTION_ADMIN' THEN true WHEN 'FINANCE' THEN true
 ELSE false END)
 $policy$,pol,tab);
 END LOOP;
END $$;
