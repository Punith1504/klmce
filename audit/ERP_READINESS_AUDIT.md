# KLMCE educational ERP readiness audit

Date: 2026-10-06. Repository: Punith1504/klmce.
Audited commit: `41976c777add05b4cc7ee2394a9a81bb3decfe56`.

**Verdict: NO-GO for production student data or a 3,000-student rollout.**

The repository contains a substantial UI and many ERP module sketches, but it
does not yet form a consistently authenticated, deployable, integrated ERP.
Startup, authorization, identity, persistence, and financial/academic integrity
must be repaired before capacity can be measured meaningfully.

## Scope and evidence limits

All 284 tracked entries were inventoried with hashes, including 88 Python files,
121 JavaScript/TypeScript files, SQL, infrastructure, mobile code, and existing
tests. AST scanning found 101 Python route declarations in 50 modules and 29
placeholder functions. Critical flows received manual source review and targeted
execution. This is a repository-wide engineering audit, **not** a claim that every
line, UI screen, or workflow was exhaustively tested.

`audit-eval-checker` is an unavailable gitlink in this checkout; its contents were
not audited. Bundled PDF/XLSX reference material was inventoried, not treated as
verified implementation or certification. No production system was accessed or
actively scanned. PostgreSQL, Redis, Docker, and k6 executables were not available
on PATH. There was no supplied staging deployment, deployment configuration,
identity-provider test account set, or payment-provider sandbox.

Backend tests use real functions with DB/cache doubles. HTTP tests mount selected
actual routers separately because `app.main` cannot import. Attendance logic tests
provide a byte AES key to isolate a separate configuration defect. Frontend tests
execute actual transpiled server actions with Prisma mocked. Consequently,
database RLS, actual transaction rollback, provider behavior, browser sessions,
and load capacity remain unverified. Several vulnerable modules are not mounted
in main; their findings apply before those modules are enabled.

## Verification results

| Check | Result | Evidence |
|---|---|---|
| New backend acceptance tests | **8 passed, 20 failed**, no skips/errors | `evidence/backend-tests.txt`, `backend-junit.xml` |
| New frontend action tests | **2 passed, 10 failed** | `evidence/frontend-tests.txt` |
| Total new executed tests | **40: 10 passed, 30 failed** | Suites above; not a security score |
| Backend startup import | **FAIL**: missing `app.auth.router` | `evidence/backend-startup.txt` |
| Python syntax compilation | PASS | `python -m compileall -q backend`; this does not validate imports |
| Frontend dependency install | PASS | `npm ci --ignore-scripts --no-audit --no-fund` |
| Prisma client generation | PASS | `npx prisma generate` |
| Frontend production build | PASS with type validation disabled | `evidence/frontend-build.txt` |
| Independent TypeScript check | **FAIL: 32 diagnostics** | `evidence/typescript.txt` |
| Existing lint command | **FAIL**: `next lint` treated as a directory | `evidence/lint.txt` |
| npm advisory scan | **52 affected dependency entries: 25 high, 27 moderate** | `evidence/npm-audit.json` |
| Existing Playwright suites | NOT RUN: no declared runner/config/auth fixtures | `tests/zero_trust.spec.ts`, `tests/e2e/*` |
| PostgreSQL/Redis integration, migrations and restore | NOT RUN | Infrastructure unavailable; startup blocked |
| 3,000-student performance acceptance | NOT RUN / NOT PROVEN | Prepared read workload and test matrix |

The npm counts include transitive and development/build tooling; they are not 52
independently proven exploitable application vulnerabilities. Triage advisories
against actual use and upgrade compatibly; do not blindly use `npm audit fix
--force`. `xlsx` is a direct high-severity flagged dependency with no fix reported
by npm for its installed package lineage. Python dependency advisory scanning was
not run. Resolved Python audit environment is recorded in evidence.

## Priority findings

Severity reflects impact if the affected code is deployed/reachable. “Executed”
means local reproduction, not exploitation of a live installation.

### F01 — Critical: JWT admin impersonation and invalid claim handling

`backend/app/core/security.py` assigns a literal JWT secret instead of reading
configuration. Helm supplies `SECRET_KEY`, but this code ignores it. A token
signed with the public source value and an invented SUPER_ADMIN identity is
accepted by `get_current_user_token` (executed failing acceptance test).
Signed access tokens with no subject, tenant, or role are accepted too. A refresh
token placed in the access cookie raises uncaught ValueError instead of 401.

Load a secret from managed configuration and refuse startup when absent; rotate
any deployed use of the source key. Validate required typed claims, issuer,
audience, expiry and token purpose. Resolve current membership/account status
server-side. Parameterize `set_config` identity values: the separate dependency
currently interpolates JWT values into `SET LOCAL` SQL strings.

### F02 — Critical: frontend write actions omit authorization

`src/app/(erp)/faculty/{attendance,results}/actions.ts` writes directly through
Prisma without verifying session, role, faculty assignment, or student enrollment.
Admin admissions, bulk import and examination actions similarly lack action-level
authorization. Clerk middleware checks sign-in only, not required role or record
ownership. Unit tests show writes succeed without an authenticated action context.
Deployed HTTP exploitation was not attempted.

Introduce one authoritative identity and permission layer; enforce it inside
each action and route. Recheck tenant and ownership on every database operation.
Do not rely on sidebar visibility, route names, or render-time gating.

### F03 — Critical: active DB dependency does not apply claimed RLS context

`backend/app/students/router.py` exposes list and bulk routes without auth/RBAC;
`timetable/router.py` has the same issue. Both use `core/database.py`, which only
opens a transaction. It never sets tenant/user/role context. The isolated students
HTTP test returns 200 anonymously with a substituted DB connection. The identity-
setting dependency in `core/dependencies.py` is a different function and has an
unimplemented pool provider.

Without context, a restricted DB role may return no records or reject writes;
an owner/superuser connection may bypass RLS. `k8s/backend.yaml` explicitly uses
`postgres`, making the bypass risk concrete in that manifest. Prove isolation
using a dedicated non-owner, non-BYPASSRLS application role, transaction-local
context and integration tests, including connection reuse across tenants.

### F04 — Critical: grievance data is not encrypted

`backend/app/grievances/whistleblower.py` formats incident text and replies into
strings headed “BEGIN PGP MESSAGE”; the confidential plaintext remains intact.
The reply persistence test reproduces this. Responses claim cryptographic
protection and anonymity without implementing either end-to-end. The module is
not included in main. Disable it until real encryption, key management, access
control, metadata minimization, and recovery procedures are implemented/tested.

### F05 — Blocker: backend is not runnable as committed

`main.py:17` imports nonexistent `app.auth.router`; the actual file is
`core/auth.py`. Admin/search/analytics import `require_roles` and `Role` from
`security.py`, where they do not exist. Authentication, ORM sessions, and numerous
module pool dependencies raise NotImplementedError or return None. Main does not
install overrides. Backend requirements omit directly imported packages including
redis, sentry-sdk, SQLAlchemy, stripe and python-multipart (additional integrations
have further dependencies).

Fix wiring and dependency declarations; require clean-environment startup and
OpenAPI/router construction in CI. Do not blindly alias auth: its own `/auth`
prefix would duplicate main's prefix. Attendance/exams already double-prefix
their paths under the current include scheme.

### F06 — Blocker: two disconnected persistence systems

Prisma uses local SQLite `file:./dev.db` with no tenant columns in the core models;
FastAPI uses PostgreSQL/asyncpg plus unrelated SQLAlchemy models and multiple SQL
schema families. The frontend bypasses PostgreSQL policies, audit triggers and
financial controls. Multiple frontend replicas would not inherently share a
SQLite file. This is an integration and consistency defect, not a claim that
SQLite can never store 3,000 students.

Choose a canonical production database/schema and migration history. Reconcile
student/user identity, foreign keys, attendance uniqueness, decimal money,
academic state and audit records. Prove frontend writes are visible to backend
reports and vice versa before scaling.

### F07 — High: attendance time, enrollment and tenant rules fail

`attendance/router.py` permits generation until class end + 15 minutes and scan
does not reject before class start. Your required normal window is class start
through 10 minutes after start, with audited exceptions afterward. Tests show
pre-start, 11-minute-late, and cross-tenant database-slot scans are accepted.
Student enrollment verification is explicitly omitted. The frontend accepts
historical dates and arbitrary status strings. Implement a shared server-side
policy with exact boundary tests, assigned faculty checks and approved exceptions.

### F08 — High: classroom QR concurrency and key configuration fail

The nonce cache key is global per QR, so the first student consumes a classroom QR
for everyone; the second-student test fails. GET then SETEX is non-atomic and runs
before full validation/commit. A crash can consume the nonce without attendance.
Use per-student/slot/date uniqueness in the database and atomic, appropriately
scoped replay controls. Test simultaneous scans and retries.

`qr_crypto.py` calls `.encode()` on the default bytes HMAC key; an environment AES
key is a string passed to AESGCM, which requires bytes. The configuration test
fails. Define validated base64/hex encodings, stable shared keys, rotation and
cross-replica verification. Random per-process keys would break multi-pod scans.

### F09 — High: rate limiter bypass and error path

`core/rate_limit.py` trusts caller-controlled `x-user-id` as the limiter identity,
allowing bucket changes. Requests in one millisecond overwrite the same sorted-set
member and are undercounted. On exhaustion, it passes `headers=` to an exception
class that does not accept that parameter, producing TypeError rather than 429.
All three behaviors are reproduced. Use verified identity plus IP policy,
collision-free request IDs, atomic accounting and tested Retry-After responses.

### F10 — High: payment persistence and idempotency are incomplete

`finance/router.py` has an insecure default HMAC secret and accepts zero/negative
amounts (executed). It inserts `COMPLETED` and `metadata`, while the initial table
allows `SUCCESS`, lacks metadata, and requires tenant_id/payment_method that are
omitted. Redis locks last only seven days and are not a durable payment uniqueness
constraint; an in-flight duplicate is acknowledged before commit, and lock
cleanup cannot handle a commit failure after the handler returns.

Use provider-validated events, currency/minor-unit validation, invoice/tenant
matching, unique provider event/payment IDs, durable event inbox and transactional
posting. Test duplicate deliveries, crash/retry, refunds and reconciliation.
`billing/router.py` also lacks payer authorization, trusts client amount, uses a
mock connected account, performs synchronous Stripe work inside async code, and
comments out ledger persistence. Do not enable real charges in this state.

### F11 — High: academic integrity and race conditions

Frontend marks accept negative, excessive, NaN and infinite values in unit tests;
max marks/pass thresholds are hardcoded. Attendance and marks do read-then-write
loops without a whole-batch transaction or the relevant composite unique keys.
The duplicate interleaving test creates two attendance writes. A later error can
leave earlier records committed.

Backend exam transitions do not consistently enforce tenant/teaching assignment;
the decorator bypasses state validation when required arguments are absent.
Revision/signature workflows lack demonstrated concurrent-row locking and end-
to-end audit proof. FastAPI route construction must also be checked after imports
are repaired because ORM objects appear in handler signatures.

### F12 — High: student identity is hardcoded in frontend pages

Student attendance/results/placement pages and document creation query roll number
`24C01A0501` instead of resolving the signed-in student. Document OCR accepts an
arbitrary document ID and persists invented skills and CGPA without parsing any
file; the test reproduces this. Replace fixed identity with authorized mappings
and return unknown/pending until real extraction has evidence.

### F13 — High: SSO/session lifecycle incomplete

OAuth token exchange issues a token for an unregistered client, wrong secret and
invented code (executed). This module is unmounted. SSO integration callbacks
return placeholder tokens; core callback is `pass`. Refresh cookie path
`/api/auth/refresh` does not reach frontend `/api/v1/auth/refresh` (executed).
Refresh rotation has no persisted revocation/reuse detection; logout only deletes
cookies. MFA enrollment/recovery and account disablement are not proven.
Freshly resolved passlib 1.7.4/bcrypt 5.0.0 fails the password roundtrip test.

### F14 — High: migrations and database constraints do not match code

Initial SQL uses TIME for timetable times while attendance ORM uses timezone-aware
DateTime. Attendance model columns are absent from initial schema. The partition
script selects `record_id` from a table whose initial PK is `attendance_id`, and
rebuilds tables without restoring original security policies/triggers. Finance,
hostel and library code also refer to inconsistent table names.

Several later schema families (e.g. `obe` and `finance`) have no RLS definitions
in their migration files; some child records lack tenant columns and verified
tenant-preserving foreign keys. Initial parent policy scopes only students, not
every child's finance/marks/attendance table. Execute ordered migrations on clean
and upgraded databases, then test privileges/constraints as the actual app role.

### F15 — High: rollover could graduate the entire active tenant

`admin/router.py` updates every ACTIVE student to ALUMNI without terminal-year
criteria, deletes the tenant's timetable, and writes audit columns/actions that
do not match initial audit schema. Request years are not used to scope rows.
Keep disabled; design an idempotent preview/approval workflow, cohort-specific
promotion and preserved history, then test retries and rollback.

### F16 — High: sensitive caching and staging privacy

PWA configuration broadly applies NetworkFirst caching to HTTP GET traffic,
potentially including authenticated records. Only attendance POST is explicitly
excluded. This is a configuration risk, not a verified browser leak: inspect the
generated worker and test logout/user-switch/offline behavior before enabling it.
`ops/anonymize_db.sql` leaves user names, MFA secrets and other module data intact;
audit purge is commented out and student updates can write original PII into audit
logs. Its financial UPDATE conflicts with immutable-ledger goals. Use synthetic
fixtures until full anonymization and retention controls are validated.

### F17 — High: deployment/operations are not production evidence

Compose frontend context `./frontend` does not exist; it mounts only initial
schema and migration 001 and defines no Celery worker/beat. Standalone Kubernetes
readiness points to `/api/v1/health`, but main exposes `/health`. The health handler
only tests that pool/client objects exist, not live connectivity. Helm uses a
different deployment path, so fix and verify both or choose one supported path.
CI deployment stages merely echo; Helm commands are commented out. The ZAP target
is a fixed hostname, not proof that the audited revision was deployed or tested.

Backup script container naming differs from Compose. No restore exercise or
measured recovery objective is supplied. Avoid claiming resilience from YAML
alone. Add tested migrations, immutable images, real readiness checks, secret
injection, least-privilege services, worker supervision and restore drills.

### F18 — High: unfinished module behavior must be clearly separated from live ERP

Main includes only 11 router imports, versus 50 route-declaring modules. Admission
roll generation fixes its sequence to 42; provisioning tasks use simulated data.
Question assembly can underfill papers after rounding/shortages. Plagiarism scores
are random; IQAC figures are hardcoded. Payment receipts show a fixed amount;
nightly reconciliation is logging-only. AI embeddings are constant. Grievances,
hostel, library, payroll, social, alumni and integrations frequently use placeholder
pool dependencies and no explicit auth guard. Hardware WebSocket identity and
cross-pod routing are not implemented in the inspected library path. Treat these
as incomplete capabilities until real persistence and authorization are tested.

### F19 — High: quality gates permit invalid releases

32 TypeScript diagnostics include Prisma schema mismatches, missing mobile/Expo
dependencies, UI prop mismatches and missing Playwright dependency. The build
skips type validation, and `npm run lint` fails. Existing UI mocks cannot prove
database contention, MFA or service-worker guarantees. Restore type/lint gates,
separate mobile configuration, add real service-backed integration tests, and
require the security contract suite before release.

## Capacity assessment for 3,000 students

3,000 enrolled students and 3,000 simultaneous requests are different workloads.
No safe numerical capacity claim follows from the current code or Kubernetes HPA.
The prepared k6 script is a **read-only starting point and was not executed**.

Proposed synthetic dataset: 3,000 students, 150 faculty, 50 administrators, 60
sections; adapt these assumptions to the college. With six periods/day and 180
teaching days, one year represents about **3.24 million attendance rows**. Include
at least three years of realistic history, fees, results, assignments and audits.

| Scenario | Proposed workload | Acceptance requirement |
|---|---|---|
| Population correctness | Every one of 3,000 accounts | Correct own data; no cross-student/tenant disclosures |
| Normal peak | 50, 150, then 300 active users | Proposed p95 <1.5s, p99 <3s, errors <1%; zero authorization leaks |
| Attendance rush | 3,000 submissions over 60s, plus deliberate burst | Exactly one row/student/slot/date; no lost accepted writes; correct 10-minute policy |
| Login/MFA rush | Staged burst of legitimate users plus abuse | Valid users complete; abuse is 429; no bypass or 500 from limiter |
| Last-seat contention | 100 simultaneous attempts on one remaining seat/bed | Exactly one allocation, deterministic conflict/waitlist |
| Fee/results publication | 3,000 reads after publish, concurrent legitimate updates | Stable published snapshot and exact ledger totals |
| Payment retries | Same event concurrently, delayed beyond cache TTL, crash before/after commit | Exactly one durable posting and recoverable processing |
| Soak/recovery | 2h realistic workload; DB/Redis/worker interruption | Bounded resources/queues, no silent loss, recovery verified |

Targets above are proposed acceptance thresholds, not measured results or college
requirements. Record CPU, RAM, DB/Redis versions, connection/worker counts, dataset
size, p50/p95/p99, throughput, errors, slow queries, locks and resource saturation.
Test from a separate load host against a fixed staging revision.

Concrete capacity risks: unpaginated student lists, synchronous CSV parsing with
all records accumulated in memory, serial per-record ORM queries, full-history
analytics scans, synchronous provider calls, SSE responses retaining database
connections, nonce contention, and local SQLite under multiple frontend replicas.
Backend pools default to 20 connections per process; 50 pods could create 1,000
client connections before additional workers. Budget the whole topology rather
than assuming an HPA creates database capacity.

## Remediation order and release gates

1. **Runnable foundation:** unify schema/identity, repair imports/dependencies,
   wire pools, normalize routes, make clean bootstrap and type/lint gates pass.
2. **Access control:** replace literal secrets; validate/revoke sessions; enforce
   action/route RBAC and ownership; prove tenant/parent/student isolation using
   the actual restricted database role.
3. **Academic/financial correctness:** implement attendance window/enrollment,
   atomic uniqueness, marks limits/states, durable webhook idempotency and audit
   trails. Disable fabricated processing and insecure grievance handling.
4. **Complete each operational module:** prove admission → enrollment → timetable
   → attendance/results → fees workflows, plus required campus services. Add real
   browser tests across student, parent, faculty, finance and admin accounts.
5. **Production operations:** clean/upgrade migration tests, tested backup/restore,
   staging privacy, functioning workers, observability and safe deployment gates.
6. **Capacity sign-off:** run the defined synthetic load, contention and recovery
   scenarios; remediate bottlenecks and repeat only failed gates.

Release only after critical/high findings are resolved or explicitly accepted
with evidence by the owner, all required behavior tests pass, and real integration,
capacity and restore tests meet the agreed targets. The 10 passing tests establish
only their narrow contracts; they are not a 25% readiness score.
