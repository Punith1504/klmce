# ERP remediation — draft, not a production release

The original audit remains in this directory as baseline evidence. This branch fixes the core trust boundary and deliberately reduces exposed functionality. A passing test for a disabled module establishes containment, not a completed ERP feature.

## Implemented

- Mandatory configured JWT and attendance keys, fixed JWT purposes/issuer/audience, valid bcrypt hashing, active database membership lookup, staff MFA, revocable local sessions and single-use refresh rotation.
- Clerk bearer validation uses the configured issuer and JWKS only, checks authorized party, session status and recent staff second factor. Clerk subjects must be explicitly mapped to existing users; public signup grants no ERP role.
- Authenticated canonical PostgreSQL access from the frontend; no direct SQLite writes. Role checks in server actions and backend, record-scoped RLS, transaction-local identity, composite tenant foreign keys and bounded lists/imports.
- Assigned faculty attendance within the scheduled class window; enrolled student QR scans; database uniqueness; all-or-nothing roster insert; justified administrator corrections and audit triggers.
- Assigned faculty marks bounded by exam maximum, locked state transitions, independent administrator approval, row locking and approved revision windows that cannot bypass state transitions.
- Private responses are not cached; legacy service worker retires its private cache. TypeScript failures are no longer suppressed. Upload, fake OCR, payment posting and legacy unfinished modules cannot report a false successful write.

## Explicitly unfinished

Payment provider verification/posting, invoices/refunds/reconciliation, uploads and malware scanning, encrypted grievance workflows, admissions automation, full exam scheduling/publication UI, CBCS concurrency, HR/payroll, hostel/transport/library and mobile workflows remain unavailable or outside the mounted API. Their old prototype source is not an approved production implementation. The restricted core screens are listed in `src/app/(erp)/layout.tsx`.

No claim of 3,000 concurrent users is made. Enrollment count is distinct from concurrency. Run the scenarios in the capacity section of `ERP_READINESS_AUDIT.md` and `tests/audit/read-capacity.k6.js` against a representative staging environment before capacity approval, including a realistic historical dataset, 300 simultaneous users, the attendance burst, database pool saturation and dependency failure. Record p95/p99 latency, errors, resource saturation and evidence of no duplicate/lost writes.

## Start a new staging environment

1. Use a dedicated PostgreSQL 16 database and Redis 7 service. Copy `.env.example` and generate independent secrets; do not use example passwords. Docker Compose has corrected build paths and binds database/cache/API ports to localhost. Configure HTTPS ingress for the UI; local login cookies require HTTPS.
2. Start only the database/cache: `docker compose up -d postgres redis`. Export `DATABASE_ADMIN_URL` pointing to localhost and the owner account. Install `backend/requirements.txt` in a virtual environment.
3. Run `python backend/scripts/migrate.py`. It applies exactly the supported baseline, master data and security migration atomically, with checksums. Do not run all numbered legacy migrations: they target incompatible data models. The runner refuses untracked existing schemas.
4. Export a generated `ERP_DB_PASSWORD` and run `python backend/scripts/provision_runtime.py`. Use `erp_runtime` in the backend `DATABASE_URL`, never the owner or a role that can bypass RLS. The runtime checks this on startup. Do not expose owner credentials to the backend container in a real deployment; Compose's shared env file is only a staging convenience.
5. Configure a real Clerk application, exact `FRONTEND_URL` and `CLERK_ISSUER`, and frontend Clerk keys. Map each user to their `external_subject` and institution using an authorized administrative provisioning process. Map student `user_id`, parent and section; assign faculty and timetable. Staff must enroll and verify a second factor. Never infer a role or institution from an unverified email/domain/client claim.
6. Start backend/frontend. `/live` is process liveness; `/health` checks database and Redis. Verify role-specific login, real records, logout/revocation, no access by an unmapped account and the approved second-factor flow with the institution's actual Clerk setup.

## Existing installation / rollback

Do not apply the new migration blindly to a populated legacy installation. First take an encrypted backup and restore it into an isolated staging database. Compare actual schema and migration history. Reconcile missing sections, tenant-mismatched references, duplicate attendance and out-of-range marks; never silently delete conflicting records. Adopt checksums only after an administrator has verified the exact baseline. Test the upgrade on the restored copy, including audit attribution and role isolation.

Before release, perform and time a restore drill, verify row counts, sample records, constraints and audit history, then document RPO/RTO and backup retention. Rollback requires the tested application image and verified database restore plan; do not reverse integrity constraints by deleting data. These operational checks require access to the deployment and have not been executed by this change.

## Repeatable checks

- `npm ci && npm run typecheck && npm run lint && npm run test:audit && npm run build`
- `pip install -r tests/audit/requirements.txt` then `PYTHONPATH=backend pytest tests/audit -v`
- Real-service tests: use a **fresh disposable** PostgreSQL database, `DATABASE_ADMIN_URL`, restricted `DATABASE_URL` matching the test login, `REDIS_URL`, and `ERP_DISPOSABLE_TEST_DB=1`; run `PYTHONPATH=backend pytest tests/integration -v`. CI supplies these services. Secrets are ephemeral in `tests/conftest.py` only.

The frontend action harness mocks Clerk/network boundaries; it is not browser authentication evidence. The database suite uses the real migration, real RLS, an actual non-owner login, actual HTTP routes and Redis session rotation. Neither substitutes for an institution-specific identity-provider smoke test or a staging load/restore test.
