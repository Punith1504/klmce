# Phase two — 8 October 2026

**Still NO-GO for production.** This is incremental remediation on draft PR #2,
not completion of every ERP module or certification for 3,000 simultaneous users.

## Implemented and exercised

- Admin enrollment with same-tenant, active student/parent account linkage;
  duplicate and cross-tenant rejection. This does not create/invite Clerk accounts.
- Course/section/timetable setup and exam schedules tied to assigned faculty.
  Unentered marks cannot be submitted or published; separate admin approval and
  publication are required. Revisions must go through approval again.
- Razorpay test-mode invoice/order APIs, parent/student-scoped checkout,
  exact raw-body HMAC validation, merchant/order/amount binding, durable order
  reservation before provider calls, administrator order recovery, atomic capture
  posting and event/payment deduplication. Sandbox ledger is append-only and
  cannot settle real fees. Live keys are rejected. See `RAZORPAY_SANDBOX.md`.
- A checksum-verified local depth/node guard for vulnerable `braces` 3.0.3.
  Install, lint and build fail closed on an unexpected source version. Recursive
  inputs and direct ASTs are tested; ordinary nested glob behavior is preserved.
  This is a **local mitigation**, not an upstream fixed release or clean npm scan.

## Verified CI checkpoint

Run [37778524194](https://github.com/Punith1504/klmce/actions/runs/37778524194)
tested `e17687a3f62c5d12e0c1a108e770f5abf19e556f`:

| Check | Result |
|---|---|
| Backend unit/security and real PostgreSQL/Redis integration | 71 passed, one deprecation warning |
| Frontend action tests | 16 passed |
| Braces regression/security tests | 12 passed |
| TypeScript, lint, frontend production build | Passed |
| Real HTTP history reads | 9,000 requests, zero HTTP errors; ownership checked on every response |
| Attendance burst | 3,000 writes at 300 in flight, exactly 3,000 durable rows; 100 duplicate replays add no rows |
| Encrypted backup/restore | 23 tables: counts and SHA-256 fingerprints match; restored RLS/runtime privileges verified |
| Proposed read latency gate | **FAILED** at 150 and 300 in flight; threshold unchanged |

The provider boundary in payment tests is mocked; the database, RLS, authenticated
routes, concurrency, rollback and Redis are real. Real Razorpay credentials and
test-merchant/browser acceptance have not been provided or executed.

## Measured history workload

Synthetic dataset: 3,000 students, 180,000 attendance records, 30,000 published
marks and 60 sections. Two Uvicorn workers; PostgreSQL and Redis service containers.
Requests use real loopback TCP/HTTP, not the in-process ASGI transport.

| Concurrent requests | p95 | p99 | HTTP errors |
|---|---:|---:|---:|
| 50 | 631.72 ms | 1,100.80 ms | 0 |
| 150 | 1,900.83 ms | 2,751.83 ms | 0 |
| 300 | 4,276.85 ms | 6,622.74 ms | 0 |

Budget remains p95 below 1,500 ms and p99 below 3,000 ms at every level.
QR burst p95 was 7,655.64 ms, p99 11,783.11 ms; all writes persisted. Backup/restore
round trip took 11.12 seconds for 29,884,634 encrypted bytes. These are disposable
runner measurements, not production RTO, storage durability or college capacity.
The drill's encryption key is ephemeral; actual key custody/recovery is untested.

Structured failed-run evidence is retained at
`remediation-evidence/operational-37778524194.json`. Earlier runs also missed the
latency gate; one run encountered an HTTP read error during the write burst.
Do not treat that as a passing capacity test or erase failures after optimization.
The identity lookup now uses the UUID index; history responses avoid duplicate
JSON encoding and prepared queries are cached for direct PostgreSQL. Additional
server/client timing instrumentation is under evaluation; thresholds are not
relaxed to produce a green build.

## Remaining release requirements

1. Diagnose high-concurrency tails and verify against representative deployed
   infrastructure with a separate load generator, dependency failure cases,
   mixed staff/student work and defined campus SLOs.
2. Configure and verify the institution's actual Clerk mapping/MFA and complete
   authenticated browser acceptance for each supported role.
3. Verify real Razorpay sandbox checkout, delivery/replays and timeout recovery;
   design/review live ledger, refunds, settlement and operational reconciliation.
4. Verify deployment backup storage, key recovery, restore procedures and RPO/RTO.
5. Complete or explicitly exclude remaining modules and mobile. Most prototype
   modules remain deliberately unavailable; the entire ERP is not finished.
6. Replace the local braces mitigation when an upstream fix is available and
   repeat dependency scans. The last all-scope scan still reports seven high
   development dependency entries; no claim of zero vulnerabilities is made.

No merge, deployment, real payment or production student-data operation has been
performed. The legacy fake deployment workflow remains blocked.
