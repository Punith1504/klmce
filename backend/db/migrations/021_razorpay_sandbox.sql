-- Sandbox is deliberately isolated from fee_transactions / real balances.
CREATE TABLE finance_invoices (
 invoice_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL REFERENCES tenants,
 student_id uuid NOT NULL, reference varchar(100) NOT NULL, amount_paise bigint NOT NULL CHECK(amount_paise BETWEEN 100 AND 100000000),
 currency text NOT NULL DEFAULT 'INR' CHECK(currency='INR'), mode text NOT NULL DEFAULT 'TEST' CHECK(mode='TEST'),
 status text NOT NULL DEFAULT 'UNPAID' CHECK(status IN('UNPAID','PAID')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,invoice_id), UNIQUE(tenant_id,reference),
 FOREIGN KEY(tenant_id,student_id) REFERENCES students(tenant_id,student_id)
);
CREATE TABLE finance_orders (
 order_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL,
 invoice_id uuid NOT NULL UNIQUE, account_id text NOT NULL, key_id text NOT NULL CHECK(key_id LIKE 'rzp_test_%'),
 provider_order_id text UNIQUE, status text NOT NULL DEFAULT 'RESERVED' CHECK(status IN('RESERVED','READY','PAID')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,order_id),
 FOREIGN KEY(tenant_id,invoice_id) REFERENCES finance_invoices(tenant_id,invoice_id)
);
CREATE TABLE finance_captures (
 capture_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL,
 invoice_id uuid NOT NULL UNIQUE, order_id uuid NOT NULL UNIQUE, payment_id text NOT NULL UNIQUE,
 amount_paise bigint NOT NULL CHECK(amount_paise>0), currency text NOT NULL CHECK(currency='INR'),
 mode text NOT NULL DEFAULT 'TEST' CHECK(mode='TEST'), created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,invoice_id) REFERENCES finance_invoices(tenant_id,invoice_id),
 FOREIGN KEY(tenant_id,order_id) REFERENCES finance_orders(tenant_id,order_id)
);
CREATE TABLE finance_webhook_events (
 event_id text PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants,
 payment_id text NOT NULL REFERENCES finance_captures(payment_id), body_sha256 text NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE tab text; BEGIN
 FOREACH tab IN ARRAY ARRAY['finance_invoices','finance_orders','finance_captures','finance_webhook_events'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',tab);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',tab);
  EXECUTE format('CREATE POLICY tenant_scope ON %I USING(tenant_id=nullif(current_setting(''app.current_tenant_id'',true),'''')::uuid)',tab);
 END LOOP;
END $$;
CREATE POLICY invoice_read ON finance_invoices AS RESTRICTIVE FOR ALL USING(
 current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN','FINANCE') OR
 (current_setting('app.current_user_role',true) IN('STUDENT','PARENT') AND student_id IN(SELECT student_id FROM students)));
CREATE POLICY invoice_create ON finance_invoices AS RESTRICTIVE FOR INSERT WITH CHECK(
 current_setting('app.current_user_role',true) IN('SUPER_ADMIN','INSTITUTION_ADMIN','FINANCE') AND status='UNPAID');
CREATE POLICY order_scope ON finance_orders AS RESTRICTIVE FOR ALL USING(invoice_id IN(SELECT invoice_id FROM finance_invoices));
CREATE POLICY capture_scope ON finance_captures AS RESTRICTIVE FOR SELECT USING(invoice_id IN(SELECT invoice_id FROM finance_invoices));
GRANT SELECT,INSERT ON finance_invoices,finance_orders TO app_user;
GRANT UPDATE(invoice_id) ON finance_invoices TO app_user; -- permits row locks, not price/status edits
GRANT UPDATE(provider_order_id,status) ON finance_orders TO app_user;
GRANT SELECT ON finance_captures TO app_user;
CREATE TRIGGER audit_finance_invoice AFTER INSERT OR UPDATE OR DELETE ON finance_invoices FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('invoice_id');
CREATE TRIGGER audit_finance_order AFTER INSERT OR UPDATE OR DELETE ON finance_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('order_id');
CREATE TRIGGER audit_finance_capture AFTER INSERT OR UPDATE OR DELETE ON finance_captures FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('capture_id');

-- Only the verified capture service calls this function. No runtime direct
-- ledger writes, no tenant taken from payment notes, no browser-success credit.
CREATE FUNCTION erp_razorpay_capture(p_tenant uuid,p_account text,p_order text,p_payment text,
 p_amount bigint,p_currency text,p_event text,p_hash text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE ord finance_orders; inv finance_invoices; prior finance_captures; event finance_webhook_events;
BEGIN
 SELECT * INTO ord FROM finance_orders WHERE tenant_id=p_tenant AND account_id=p_account AND provider_order_id=p_order FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown payment order'; END IF;
 SELECT * INTO inv FROM finance_invoices WHERE invoice_id=ord.invoice_id FOR UPDATE;
 IF inv.amount_paise<>p_amount OR inv.currency<>p_currency OR inv.mode<>'TEST' THEN RAISE EXCEPTION 'Payment amount or mode mismatch'; END IF;
 SELECT * INTO event FROM finance_webhook_events WHERE event_id=p_event;
 IF FOUND THEN
  IF event.body_sha256<>p_hash OR event.payment_id<>p_payment OR event.tenant_id<>p_tenant THEN RAISE EXCEPTION 'Event collision'; END IF;
  RETURN 'duplicate';
 END IF;
 SELECT * INTO prior FROM finance_captures WHERE invoice_id=inv.invoice_id;
 IF FOUND AND (prior.payment_id<>p_payment OR prior.order_id<>ord.order_id) THEN RAISE EXCEPTION 'Invoice already captured: review required'; END IF;
 PERFORM set_config('app.current_tenant_id',p_tenant::text,true),set_config('app.current_user_id','',true),set_config('app.current_user_role','PAYMENT_WEBHOOK',true);
 IF prior.capture_id IS NULL THEN
  INSERT INTO finance_captures(tenant_id,invoice_id,order_id,payment_id,amount_paise,currency) VALUES(p_tenant,inv.invoice_id,ord.order_id,p_payment,p_amount,p_currency);
  UPDATE finance_invoices SET status='PAID' WHERE invoice_id=inv.invoice_id;
  UPDATE finance_orders SET status='PAID' WHERE order_id=ord.order_id;
 END IF;
 INSERT INTO finance_webhook_events(event_id,tenant_id,payment_id,body_sha256) VALUES(p_event,p_tenant,p_payment,p_hash);
 RETURN CASE WHEN prior.capture_id IS NULL THEN 'posted' ELSE 'duplicate' END;
END $$;
REVOKE ALL ON FUNCTION erp_razorpay_capture(uuid,text,text,text,bigint,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION erp_razorpay_capture(uuid,text,text,text,bigint,text,text,text) TO app_user;
CREATE FUNCTION reject_sandbox_ledger_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Sandbox capture ledger is append-only'; END $$;
CREATE TRIGGER immutable_sandbox_captures BEFORE UPDATE OR DELETE ON finance_captures FOR EACH ROW EXECUTE FUNCTION reject_sandbox_ledger_mutation();
CREATE TRIGGER immutable_sandbox_events BEFORE UPDATE OR DELETE ON finance_webhook_events FOR EACH ROW EXECUTE FUNCTION reject_sandbox_ledger_mutation();
