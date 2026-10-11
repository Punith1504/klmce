# KLMCE ERP Test Report

## Summary
* **Total tests collected:** 42
* **Real Passing tests:** 7
* **Placeholder/Fake tests:** 25 (These tests just contain `pass` and do not test anything)
* **Failing tests:** 10

## Real Pass/Fail Counts per File

| File | Passed (Real) | Passed (Fake) | Failed |
|---|---|---|---|
| `tests/security/test_rls.py` | 2 | 0 | 0 |
| `tests/security/test_rls_advanced.py` | 1 | 0 | 1 |
| `tests/security/test_rbac.py` | 2 | 0 | 0 |
| `tests/security/test_jwt.py` | 1 | 0 | 3 |
| `tests/security/test_auth.py` | 0 | 0 | 2 |
| `tests/security/test_mfa_password.py` | 3 | 3 | 1 |
| `tests/security/test_audit.py` | 0 | 0 | 2 |
| `tests/security/test_injections.py` | 0 | 2 | 0 |
| `tests/business/test_exams.py` | 0 | 0 | 1 |
| `tests/business/test_attendance.py` | 0 | 2 | 0 |
| `tests/business/test_cbcs.py` | 0 | 1 | 0 |
| `tests/business/test_fees.py` | 0 | 3 | 0 |
| `tests/business/test_grades.py` | 0 | 3 | 0 |
| `tests/business/test_locks.py` | 0 | 2 | 0 |
| `tests/business/test_rollover.py` | 0 | 1 | 0 |
| `tests/business/test_timetable.py` | 0 | 1 | 0 |
| `tests/integration/test_celery.py` | 0 | 3 | 0 |
| `tests/integration/test_uploads.py` | 0 | 3 | 0 |

## Failure Analysis

### 1. `test_update_exam_mark_missing_dependency_FAILS_DUE_TO_RLS_BUG`
* **Message:** `assert 404 == 200`
* **Classification:** **(a) Bug in app code**
* **Reason:** The RLS policy on the `exam_marks` or `users` table prevents the user from updating the mark, resulting in a 404 Not Found instead of a successful 200 OK update.

### 2. `test_app_role_cannot_delete`
* **Message:** `Failed: DID NOT RAISE <class 'asyncpg.exceptions.InsufficientPrivilegeError'>`
* **Classification:** **(a) Bug in app code**
* **Reason:** The `erp_app` database role incorrectly has `DELETE` privileges on the `students` table, exposing a severe vulnerability.

### 3. `test_audit_log_created_on_update`
* **Message:** `AssertionError: VULNERABILITY: No audit log generated for update`
* **Classification:** **(a) Bug in app code**
* **Reason:** The `exam_marks` table is missing the trigger that inserts into `audit_logs` on update.

### 4. `test_mfa_cannot_be_bypassed_FAILS_DUE_TO_RLS_BUG`
* **Message:** `assert 404 == 401`
* **Classification:** **(a) Bug in app code** / **(b) Bad test code**
* **Reason:** The test hits `/api/v1/auth/login` and receives a 404 Not Found, rather than the expected authentication failure.

### 5. `test_login_fails_due_to_rls_bug`
* **Message:** `assert 404 == 401`
* **Classification:** **(a) Bug in app code**
* **Reason:** Same as above, the endpoint is throwing a 404. It should be throwing a 401 due to the RLS bug blocking the user lookup.

### 6. `test_otp_rate_limiting_and_lockout`
* **Message:** `AssertionError: VULNERABILITY: No rate limit or lockout on MFA \n assert 404 == 429`
* **Classification:** **(a) Bug in app code**
* **Reason:** The endpoint lacks rate limiting, failing to return a 429 Too Many Requests status.

### 7. `test_jwt_rejects_tampered`
* **Message:** `assert 503 == 401`
* **Classification:** **(c) Test environment problem**
* **Reason:** The endpoint `/api/v1/timetable/courses` throws a 503 Service Unavailable because the database connection pool dependency (`Depends(get_db_pool)`) is not fully mocked in `conftest.py` for routers other than auth.

### 8. `test_jwt_rejects_expired`
* **Message:** `assert 503 == 401`
* **Classification:** **(c) Test environment problem**
* **Reason:** Same as above, the timetable endpoint is throwing a 503 due to missing DB pool mocks, pre-empting the JWT 401 check.

### 9. `test_jwt_rejects_alg_none`
* **Message:** `assert 503 == 401`
* **Classification:** **(c) Test environment problem**
* **Reason:** Same as above.

### 10. `test_rls_pooled_connection_leak_prevention`
* **Message:** `AssertionError: VULNERABILITY: RLS pooled connection error {'type': 'probs/database-unavailable', 'title': 'Database Unavailable', 'status': 503, 'detail': 'The database connection pool has not been initialized or is offline.', 'instance': 'http://test/api/v1/timetable/courses'}`
* **Classification:** **(c) Test environment problem**
* **Reason:** Same as above. The `conftest.py` dependency override needs to match the exact import path used by the `timetable` router for the `get_db_pool` dependency.

---
**Note:** I have fixed the manual DB setup issue in `test_jwt.py` (fetching passwords) and updated `conftest.py` to correctly mount all routers and use the `auth_tokens` fixture for proper authentication across tests. However, the dependency override issues (c) remain tricky due to FastAPI's strict dependency injection matching.
