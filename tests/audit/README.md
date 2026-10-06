# ERP acceptance tests

These tests describe required behavior and intentionally remain red for defects
in commit `41976c777add05b4cc7ee2394a9a81bb3decfe56`. They do not change application
behavior. Do not weaken assertions or add xfail markers to manufacture a pass.

```bash
python -m venv .venv-audit
.venv-audit/bin/pip install -r tests/audit/requirements.txt
.venv-audit/bin/python -m pytest tests/audit/test_backend_contracts.py -q
npm ci --ignore-scripts
npx prisma generate
node --test --test-reporter=tap tests/audit/frontend-actions.test.cjs
npx tsc --noEmit --incremental false
python tests/audit/inventory.py
```

Python tests execute actual production functions. Database and Redis boundaries
are doubles; two isolated FastAPI applications exercise actual routers through
HTTP TestClient without the broken main entry point. The attendance fixture
supplies a byte AES key solely to isolate business-rule tests from the separately
tested environment-key defect. No production source is patched.

Frontend tests transpile the actual action files using the installed TypeScript
compiler and execute them with Prisma and cache invalidation mocked. They verify
action behavior, not deployed Server Action transport, Clerk sessions, or actual
database transactions. The duplicate test reproduces an unsafe interleaving;
real uniqueness and transaction tests must follow on the chosen database.

The added audit dependencies supplement missing production dependencies so deeper
tests can run. `audit/evidence/python-environment.txt` records resolved versions.
Existing Playwright tests were inspected but not executed: the repository does
not declare `@playwright/test`, a Playwright configuration, or authenticated test
fixtures. Some tests mock the exact backend guarantees they purport to verify.

## Capacity profile

`read-capacity.k6.js` is a prepared, unexecuted staging read workload, not a
certificate of capacity. Install k6 separately. Repair startup/auth/data access,
seed 3,000 synthetic accounts and realistic historical data, and create a private
fixture outside Git containing real staging cookies and implemented route checks.
Sessions must remain valid for the test duration, or an approved refresh strategy
must be added. Expired sessions must not be counted as capacity defects.

```bash
BASE_URL=https://your-authorized-staging-host \
PROFILES_FILE=/private/synthetic-student-profiles.json \
ALLOW_STAGING_LOAD=yes k6 run tests/audit/read-capacity.k6.js
```

Every account is read once, then 50/150/300 concurrent read users are exercised.
This does not exercise attendance bursts, writes, payments, or 3,000 simultaneous
users. Those need the separate scenarios and invariants in the audit test matrix.
Never commit session cookies. Run against synthetic staging only.
