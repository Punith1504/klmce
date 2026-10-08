# Razorpay sandbox handoff

This is a test-mode integration, not permission to collect live fees. It rejects
live API keys and keeps test invoices/captures separate from `fee_transactions`.
The existing generic `/finance/webhook` remains disabled. No real card data,
API credentials, provider responses containing personal data, or raw webhook
bodies are stored in this repository or application logs.

## Configure a disposable staging environment

1. Apply the supported migration runner through `021_razorpay_sandbox.sql` with
   the migration owner. Run the application with the restricted runtime role.
2. Use synthetic student and parent accounts in one staging tenant. The initial
   integration binds one configured merchant account to exactly that tenant.
3. In the backend secret manager set `RAZORPAY_ENABLED=true`,
   `RAZORPAY_TENANT_ID`, `RAZORPAY_ACCOUNT_ID`, `RAZORPAY_KEY_ID` (must start
   `rzp_test_`), `RAZORPAY_KEY_SECRET`, and a separate random
   `RAZORPAY_WEBHOOK_SECRET` (at least 32 characters). Do not send secrets in chat.
4. In Razorpay **test mode**, configure auto-capture and subscribe only to
   `payment.captured` and `order.paid` at the backend HTTPS endpoint
   `/api/v1/finance/razorpay/webhook`. The endpoint verifies the signature of the
   exact raw body and the expected account ID. Do not use the authenticated
   frontend `/api/erp` proxy as the webhook URL.
5. As institution administrator, create a sandbox invoice at `/admin/finance`
   using a synthetic student UUID. Amounts are integer paise, not floats or
   caller-chosen checkout amounts. As that student or linked parent, open the
   **test checkout** from the fee page. Use Razorpay's documented test details.

## Required provider acceptance before any live implementation

- Verify success and failure using the real test merchant. A browser completion
  callback is informational only; it cannot change the ledger. Refresh after
  provider delivery to see the confirmed sandbox status.
- Deliver the same webhook repeatedly and concurrently, then deliver
  `order.paid` for the same payment. Require one capture and one paid invoice.
- Verify authorization-only events, mismatched amounts/currencies/accounts,
  invalid signatures, unknown orders and a second capture never post credit.
- Simulate timeout after provider order creation. The durable local reservation
  must remain `RESERVED`; another click must not create another provider order.
- Recover the order at `/admin/finance`: in the test merchant dashboard find
  the receipt matching the local order UUID **without hyphens**, then supply
  its Razorpay order ID. The backend fetches that order using configured merchant
  credentials and verifies receipt, exact amount and currency. Replay the
  captured webhook afterward. Recovery itself never credits the invoice.
- If the provider did not create an order, or a payment failed, do not create
  replacement invoices casually: cancellation/retry workflow is not implemented.
  Resolve the order with the merchant and retain the audit trail. This initial
  sandbox permits only one durable provider order per invoice.
- Restart the backend between delivery attempts and verify the result remains
  duplicate-safe. Restore a backup and verify RLS/ledger permissions afterward.

Automated tests mock only provider HTTP calls; they exercise actual application
authentication, PostgreSQL RLS, transactions and concurrent delivery in CI.
They do **not** establish merchant configuration, bank behavior, browser Checkout
compatibility, settlement, refunds, chargebacks or live payment readiness.

## Release blockers

Live mode requires a separately reviewed production-ledger migration, business
rules for invoices/refunds/overpayments, capture/settlement reconciliation and
alerting, abandoned order recovery, webhook secret rotation, rate limits,
provider sandbox evidence and a real deployment security review. No automatic
refund, capture API operation, live-key switch or fee write is implemented.
Do not alter environment/SQL mode checks to bypass these gates.

Sources checked during implementation:
- https://razorpay.com/docs/api/orders/create/
- https://razorpay.com/docs/webhooks/validate-test/
- https://razorpay.com/docs/webhooks/payments/
- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/

## Database connection note

Direct PostgreSQL uses a bounded prepared-statement cache (100 entries) to avoid
replanning history queries on each request. Set `DB_STATEMENT_CACHE_SIZE=0` when
using a transaction pooler that does not support named prepared statements, and
repeat the load tests against that actual configuration.
