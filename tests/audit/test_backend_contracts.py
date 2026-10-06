"""Security acceptance tests. Failures are release blockers, not expected passes.

Uses production functions with isolated database/cache doubles. These tests do
not establish PostgreSQL RLS, network security, or production capacity.
"""
import asyncio
import importlib
import os
from pathlib import Path
import subprocess
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import FastAPI, HTTPException, Response
from fastapi.testclient import TestClient
from starlette.requests import Request
from jose import jwt

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))
from app.core import security, dependencies


def run(coro):
    return asyncio.run(coro)


def request(cookie='', headers=()):
    return Request({'type': 'http', 'method': 'POST', 'path': '/login',
                    'headers': [(b'cookie', cookie.encode()), *headers],
                    'client': ('192.0.2.1', 1234), 'scheme': 'https',
                    'server': ('testserver', 443), 'query_string': b''})


def test_application_imports():
    result = subprocess.run([sys.executable, '-c', 'import app.main'],
        cwd=ROOT / 'backend', capture_output=True, text=True)
    assert result.returncode == 0, result.stderr


def test_publicly_known_signing_key_cannot_impersonate_admin():
    token = jwt.encode({'sub': str(uuid4()), 'tenant_id': str(uuid4()),
        'role': 'SUPER_ADMIN', 'type': 'access',
        'exp': datetime.now(timezone.utc) + timedelta(minutes=1)},
        'super-secret-key-replace-in-production', algorithm='HS256')
    with pytest.raises(HTTPException) as error:
        dependencies.get_current_user_token(request('access_token=' + token))
    assert error.value.status_code == 401


def test_missing_cookie_is_unauthorized():
    with pytest.raises(HTTPException) as error:
        dependencies.get_current_user_token(request())
    assert error.value.status_code == 401


def test_wrong_token_type_is_401_not_server_error():
    token = security.create_refresh_token({'sub': str(uuid4())})
    with pytest.raises(HTTPException) as error:
        dependencies.get_current_user_token(request('access_token=' + token))
    assert error.value.status_code == 401


def test_access_token_requires_identity_tenant_and_role():
    token = security.create_access_token({})
    with pytest.raises(HTTPException):
        dependencies.get_current_user_token(request('access_token=' + token))


def test_student_role_cannot_pass_admin_guard():
    guard = dependencies.require_roles(dependencies.Role.INSTITUTION_ADMIN)
    with pytest.raises(HTTPException) as error:
        guard({'role': 'STUDENT'})
    assert error.value.status_code == 403


def test_password_hash_and_verify_with_declared_dependencies():
    hashed = security.get_password_hash('Audit-only-password-42!')
    assert security.verify_password('Audit-only-password-42!', hashed)
    assert not security.verify_password('incorrect', hashed)


def test_refresh_cookie_reaches_frontend_refresh_url():
    from app.core.auth import set_auth_cookies
    response = Response()
    set_auth_cookies(response, 'access', 'refresh')
    refresh = next(h for h in response.headers.getlist('set-cookie') if h.startswith('refresh_token='))
    from http.cookies import SimpleCookie
    cookie = SimpleCookie(); cookie.load(refresh)
    path = cookie['refresh_token']['path']
    assert '/api/v1/auth/refresh'.startswith(path), refresh


def test_cookies_have_transport_protection():
    from app.core.auth import set_auth_cookies
    response = Response(); set_auth_cookies(response, 'a', 'r')
    for cookie in response.headers.getlist('set-cookie'):
        assert 'HttpOnly' in cookie and 'Secure' in cookie and 'SameSite=strict' in cookie


def test_students_route_rejects_anonymous_reads():
    from app.students.router import router
    from app.core.database import get_db_connection
    app = FastAPI(); app.include_router(router, prefix='/students')
    conn = SimpleNamespace(fetch=AsyncMock(return_value=[]))
    async def db():
        yield conn
    app.dependency_overrides[get_db_connection] = db
    response = TestClient(app).get('/students')
    assert response.status_code in (401, 403), response.text
    conn.fetch.assert_not_called()


def test_database_dependency_sets_transaction_local_identity():
    from app.core.database import get_db_connection, db_manager
    class Context:
        def __init__(self, value): self.value = value
        async def __aenter__(self): return self.value
        async def __aexit__(self, *args): return False
    conn = SimpleNamespace(execute=AsyncMock())
    conn.transaction = lambda: Context(None)
    old = db_manager.pool
    db_manager.pool = SimpleNamespace(acquire=lambda **kwargs: Context(conn))
    async def consume():
        async for _ in get_db_connection({'sub':str(uuid4()),'tenant_id':str(uuid4()),'role':'STUDENT'}): pass
    try:
        run(consume())
        assert conn.execute.await_count > 0, 'No RLS identity setup occurs'
    finally:
        db_manager.pool = old


class Cache:
    """Small deterministic Redis contract double, not a Redis integration test."""
    def __init__(self): self.data = {}; self.keys = []
    async def get(self, key): return self.data.get(key)
    async def setex(self, key, ttl, value): self.data[key] = value
    def pipeline(self, transaction=True): return Pipeline(self)


class Pipeline:
    def __init__(self, cache): self.cache = cache; self.ops = []
    async def __aenter__(self): return self
    async def __aexit__(self, *args): return False
    def __getattr__(self, name):
        def enqueue(*args): self.ops.append((name, args)); return self
        return enqueue
    async def execute(self):
        result = []
        for name, args in self.ops:
            key = args[0]; self.cache.keys.append(key)
            values = self.cache.data.setdefault(key, {})
            if name == 'zremrangebyscore':
                for member in list(values):
                    if args[1] <= values[member] <= args[2]: del values[member]
                result.append(0)
            elif name == 'zcard': result.append(len(values))
            elif name == 'zadd': values.update(args[1]); result.append(1)
            else: result.append(True)
        return result


def test_rate_limit_ignores_unverified_user_header():
    from app.core.rate_limit import RateLimiter
    import fakeredis.aioredis
    async def scenario():
        async with fakeredis.aioredis.FakeRedis() as cache:
            limiter=RateLimiter(1,60)
            await limiter(request(headers=[(b'x-user-id',b'first')]),cache)
            with pytest.raises(HTTPException) as error:
                await limiter(request(headers=[(b'x-user-id',b'second')]),cache)
            assert error.value.status_code==429
    run(scenario())


def test_rate_limit_returns_429_when_exhausted(monkeypatch):
    from app.core import rate_limit
    import fakeredis.aioredis
    times=iter([1000.001,1000.002])
    monkeypatch.setattr(rate_limit,'time',SimpleNamespace(time=lambda:next(times)))
    async def scenario():
        async with fakeredis.aioredis.FakeRedis() as cache:
            limiter=rate_limit.RateLimiter(1,60)
            await limiter(request(),cache)
            with pytest.raises(HTTPException) as error: await limiter(request(),cache)
            assert error.value.status_code==429
            assert error.value.headers['Retry-After']=='60'
    run(scenario())


def test_same_millisecond_requests_are_counted_individually(monkeypatch):
    from app.core import rate_limit
    import fakeredis.aioredis
    monkeypatch.setattr(rate_limit,'time',SimpleNamespace(time=lambda:1000))
    async def scenario():
        async with fakeredis.aioredis.FakeRedis() as cache:
            limiter=rate_limit.RateLimiter(2,60)
            await limiter(request(),cache); await limiter(request(),cache)
            with pytest.raises(HTTPException) as error: await limiter(request(),cache)
            assert error.value.status_code==429
    run(scenario())


def test_qr_configuration_works_with_environment_strings():
    env = dict(os.environ, ATTENDANCE_AES_KEY='a' * 32, ATTENDANCE_HMAC_KEY='b' * 32)
    result = subprocess.run([sys.executable, '-c',
        'from app.attendance.qr_crypto import generate_qr_payload; generate_qr_payload("t","s","n")'],
        cwd=ROOT / 'backend', env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr


@pytest.fixture
def attendance(monkeypatch):
    # Fix only key representation in this fixture to isolate attendance logic.
    monkeypatch.setenv('ATTENDANCE_HMAC_KEY', 'test-only-hmac')
    crypto = importlib.import_module('app.attendance.qr_crypto')
    monkeypatch.setattr(crypto, 'AES_KEY', b'a' * 32)
    monkeypatch.setattr(crypto, 'HMAC_KEY', b'b' * 32)
    router = importlib.import_module('app.attendance.router')
    tenant, faculty, student = map(str, (uuid4(), uuid4(), uuid4()))
    now = datetime.now(timezone.utc)
    slot = SimpleNamespace(slot_id=uuid4(), tenant_id=tenant, faculty_id=faculty,
        section_id=uuid4(), start_time=now - timedelta(minutes=2), end_time=now + timedelta(minutes=58))
    db = SimpleNamespace(get=AsyncMock(return_value=slot), add=Mock(), commit=AsyncMock(),
        scalar=AsyncMock(return_value=uuid4()), execute=AsyncMock())
    return SimpleNamespace(router=router, crypto=crypto, tenant=tenant, faculty=faculty,
        student=student, slot=slot, db=db, cache=Cache())


def scan(a, student=None):
    from app.attendance.schemas import ScanQRRequest
    payload = a.crypto.generate_qr_payload(a.tenant, str(a.slot.slot_id), 'shared-class-nonce')
    return a.router.scan_qr(ScanQRRequest(qr_payload=payload),
        {'tenant_id': a.tenant, 'sub': student or a.student, 'role': 'STUDENT'}, a.db, a.cache, None)


def test_distinct_students_can_scan_same_class_qr(attendance):
    a = attendance
    run(scan(a)); run(scan(a, str(uuid4())))
    assert a.db.commit.await_count == 2


def test_scan_rejected_before_class_start(attendance):
    a = attendance; a.slot.start_time = datetime.now(timezone.utc) + timedelta(minutes=5)
    with pytest.raises(HTTPException): run(scan(a))
    a.db.commit.assert_not_awaited()


def test_scan_rejected_after_ten_minute_window(attendance):
    a = attendance; a.slot.start_time = datetime.now(timezone.utc) - timedelta(minutes=11)
    with pytest.raises(HTTPException): run(scan(a))
    a.db.commit.assert_not_awaited()


def test_scan_rechecks_database_slot_tenant(attendance):
    a = attendance; a.slot.tenant_id = str(uuid4())
    with pytest.raises(HTTPException): run(scan(a))
    a.db.commit.assert_not_awaited()


def test_qr_tampering_rejected(attendance):
    a = attendance
    payload = a.crypto.generate_qr_payload(a.tenant, str(a.slot.slot_id), 'nonce')
    with pytest.raises(ValueError): a.crypto.verify_and_decrypt_qr_payload(payload + '0')


def test_qr_generation_rejects_other_faculty(attendance):
    a = attendance
    with pytest.raises(HTTPException) as error:
        run(a.router.generate_rolling_qr(a.slot.slot_id,
            {'tenant_id': a.tenant, 'sub': str(uuid4())}, a.db))
    assert error.value.status_code == 403


def test_oauth_exchange_rejects_unregistered_client():
    from app.oauth.server import exchange_token, TokenRequest
    with pytest.raises(HTTPException):
        run(exchange_token(TokenRequest(grant_type='authorization_code',
            client_id='unregistered', client_secret='wrong', code='invented')))


def test_negative_exam_marks_rejected():
    from app.exams.schemas import UpdateMarkRequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError): UpdateMarkRequest(marks_obtained=-1)


def test_missing_webhook_signature_rejected():
    from app.finance.webhook_utils import verify_webhook_signature
    with pytest.raises(HTTPException): verify_webhook_signature(b'{}', '')


def test_tampered_webhook_rejected():
    from app.finance.webhook_utils import verify_webhook_signature
    with pytest.raises(HTTPException): verify_webhook_signature(b'{"amount":1}', '0' * 64)


@pytest.mark.parametrize('amount', [-1, 0])
def test_webhook_rejects_nonpositive_payment_amount(amount):
    import hmac, hashlib, json
    from app.finance import router as finance
    from app.core.database import get_db_connection
    from app.core.redis import get_redis_client
    conn = SimpleNamespace(fetchrow=AsyncMock(return_value={'transaction_id': str(uuid4())}))
    cache = SimpleNamespace(setnx=AsyncMock(return_value=True), expire=AsyncMock(), delete=AsyncMock())
    app = FastAPI(); app.include_router(finance.router)
    async def db(): yield conn
    async def redis(): return cache
    app.dependency_overrides[get_db_connection] = db
    app.dependency_overrides[get_redis_client] = redis
    payload = json.dumps({'id': 'audit-event', 'metadata': {'student_id': str(uuid4())}, 'amount': amount}).encode()
    signature = hmac.new(finance.WEBHOOK_SECRET, payload, hashlib.sha256).hexdigest()
    response = TestClient(app).post('/webhook', content=payload, headers={'X-Payment-Signature': signature})
    assert response.status_code in (400, 422), response.text
    conn.fetchrow.assert_not_awaited()


def test_grievance_reply_is_encrypted_before_persistence():
    from app.grievances.whistleblower import ReporterReply, reporter_sends_reply
    conn = SimpleNamespace(execute=AsyncMock())
    class Context:
        async def __aenter__(self): return conn
        async def __aexit__(self, *args): return False
    pool = SimpleNamespace(acquire=lambda: Context())
    plaintext = 'Confidential audit-only allegation'
    # Secure encryption is not configured, so fail closed before any persistence.
    with pytest.raises(HTTPException) as error:
        run(reporter_sends_reply(ReporterReply(mnemonic='audit-only', message=plaintext), pool))
    assert error.value.status_code == 503
    conn.execute.assert_not_awaited()
