"""Razorpay test-mode adapter. Never logs secrets, raw events or payer details."""
import hashlib
import hmac
import json
import os
import re
from contextlib import asynccontextmanager
from dataclasses import dataclass
from uuid import UUID

import asyncpg
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field, StrictInt
from app.core.database import get_db_connection, get_db_pool
from app.core.dependencies import get_active_user, require_roles, Role

router = APIRouter(prefix='/razorpay')
ADMIN = require_roles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.FINANCE)
PAYERS = require_roles(Role.STUDENT, Role.PARENT)
ID = re.compile(r'^[A-Za-z0-9_-]{1,100}$')


@dataclass(frozen=True)
class Config:
    tenant: UUID
    account: str
    key_id: str
    secret: str
    webhook_secret: str


def config():
    try:
        c = Config(UUID(os.environ['RAZORPAY_TENANT_ID']), os.environ['RAZORPAY_ACCOUNT_ID'],
                   os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET'],
                   os.environ['RAZORPAY_WEBHOOK_SECRET'])
        assert os.getenv('RAZORPAY_ENABLED') == 'true'
        assert c.key_id.startswith('rzp_test_') and ID.fullmatch(c.key_id)
        assert c.account.startswith('acc_') and ID.fullmatch(c.account)
        assert len(c.secret) >= 16 and len(c.webhook_secret) >= 32
    except (KeyError, ValueError, AssertionError):
        raise HTTPException(503, 'Razorpay sandbox is not configured; live keys are not supported') from None
    return c


def tenant_config(token):
    c = config()
    if str(c.tenant) != token['tenant_id']:
        raise HTTPException(503, 'Razorpay is not configured for this institution')
    return c


async def provider_request(c, method, path, payload=None):
    # Fixed origin, no redirects, no automatic create retries after timeouts.
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=False, trust_env=False) as client:
            response = await client.request(method, 'https://api.razorpay.com/v1/'+path,
                auth=(c.key_id, c.secret), json=payload)
            response.raise_for_status()
            result = response.json()
            if not isinstance(result, dict): raise ValueError()
            return result
    except (httpx.HTTPError, ValueError):
        raise HTTPException(503, 'Provider result uncertain; reconcile the reserved order before retrying') from None


@asynccontextmanager
async def scoped(pool, token):
    async with pool.acquire(timeout=5) as conn:
        async with conn.transaction():
            await conn.execute("SELECT set_config('app.current_tenant_id',$1,true),set_config('app.current_user_id',$2,true),set_config('app.current_user_role',$3,true)",
                token['tenant_id'], token['sub'], token['role'])
            yield conn


class Invoice(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    student_id: UUID
    reference: str = Field(min_length=1, max_length=100)
    amount_paise: StrictInt = Field(ge=100, le=100000000)


@router.post('/invoices', status_code=201)
async def create_invoice(data: Invoice, token=Depends(ADMIN), conn=Depends(get_db_connection)):
    tenant_config(token)
    try:
        row = await conn.fetchrow('INSERT INTO finance_invoices(tenant_id,student_id,reference,amount_paise) VALUES($1,$2,$3,$4) RETURNING invoice_id::text,mode,status',
            UUID(token['tenant_id']), data.student_id, data.reference, data.amount_paise)
    except asyncpg.UniqueViolationError: raise HTTPException(409, 'Invoice reference already exists') from None
    except asyncpg.ForeignKeyViolationError: raise HTTPException(422, 'Student does not belong to this institution') from None
    return dict(row)


@router.get('/invoices')
async def invoices(token=Depends(get_active_user), conn=Depends(get_db_connection),
                   limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0, le=100000)):
    rows = await conn.fetch('''SELECT i.invoice_id::text,i.student_id::text,i.reference,i.amount_paise,i.currency,i.mode,i.status,
        o.order_id::text,o.provider_order_id,o.status AS order_status
        FROM finance_invoices i LEFT JOIN finance_orders o USING(invoice_id)
        WHERE i.tenant_id=$1 ORDER BY i.created_at DESC,i.invoice_id LIMIT $2 OFFSET $3''', UUID(token['tenant_id']), limit, offset)
    return [dict(r) for r in rows]


def validate_order(entity, order, invoice):
    if (not isinstance(entity.get('id'), str) or not re.fullmatch(r'order_[A-Za-z0-9]+', entity['id'])
        or entity.get('entity') != 'order' or entity.get('receipt') != order['order_id'].hex
        or type(entity.get('amount')) is not int or entity['amount'] != invoice['amount_paise']
        or entity.get('currency') != 'INR' or entity.get('status') not in ('created','attempted','paid')
        or entity.get('partial_payment', False) is not False):
        raise HTTPException(409, 'Provider order mismatch; manual review required')


async def attach_order(pool, token, order, invoice, entity):
    validate_order(entity, order, invoice)
    async with scoped(pool, token) as conn:
        existing = await conn.fetchrow('SELECT * FROM finance_orders WHERE order_id=$1 FOR UPDATE', order['order_id'])
        if existing['provider_order_id'] and existing['provider_order_id'] != entity['id']:
            raise HTTPException(409, 'A different provider order is already attached')
        await conn.execute("UPDATE finance_orders SET provider_order_id=$1,status=CASE WHEN status='PAID' THEN status ELSE 'READY' END WHERE order_id=$2", entity['id'], order['order_id'])


@router.post('/invoices/{invoice_id}/order')
async def create_order(invoice_id: UUID, token=Depends(PAYERS), pool=Depends(get_db_pool)):
    c = tenant_config(token)
    # Persist the reservation before making a provider call. A crash / timeout
    # leaves RESERVED, never a second blind create or an untracked charge.
    async with scoped(pool, token) as conn:
        invoice = await conn.fetchrow('SELECT * FROM finance_invoices WHERE invoice_id=$1 FOR UPDATE', invoice_id)
        if not invoice: raise HTTPException(404, 'Invoice not found')
        if invoice['status'] != 'UNPAID': raise HTTPException(409, 'Sandbox invoice is already paid')
        order = await conn.fetchrow('SELECT * FROM finance_orders WHERE invoice_id=$1', invoice_id)
        if order:
            if order['account_id'] != c.account or order['key_id'] != c.key_id:
                raise HTTPException(409, 'Merchant configuration changed; manual review required')
            if not order['provider_order_id']: raise HTTPException(409, 'Order creation is pending reconciliation')
            return {'order_id': order['provider_order_id'], 'key_id': c.key_id, 'amount': invoice['amount_paise'], 'currency':'INR', 'mode':'TEST'}
        order = await conn.fetchrow('INSERT INTO finance_orders(tenant_id,invoice_id,account_id,key_id) VALUES($1,$2,$3,$4) RETURNING *',
            c.tenant, invoice_id, c.account, c.key_id)
    entity = await provider_request(c, 'POST', 'orders', {'amount':invoice['amount_paise'], 'currency':'INR',
        'receipt':order['order_id'].hex, 'partial_payment':False})
    await attach_order(pool, token, order, invoice, entity)
    return {'order_id':entity['id'], 'key_id':c.key_id, 'amount':invoice['amount_paise'], 'currency':'INR', 'mode':'TEST'}


class Reconcile(BaseModel):
    model_config = ConfigDict(extra='forbid')
    provider_order_id: str = Field(pattern=r'^order_[A-Za-z0-9]{1,80}$')


@router.post('/orders/{order_id}/reconcile')
async def reconcile_order(order_id: UUID, data: Reconcile, token=Depends(ADMIN), pool=Depends(get_db_pool)):
    c = tenant_config(token)
    async with scoped(pool, token) as conn:
        order = await conn.fetchrow('SELECT * FROM finance_orders WHERE order_id=$1', order_id)
        if not order: raise HTTPException(404, 'Order not found')
        if order['account_id'] != c.account or order['key_id'] != c.key_id:
            raise HTTPException(409, 'Merchant configuration changed; manual review required')
        invoice = await conn.fetchrow('SELECT * FROM finance_invoices WHERE invoice_id=$1', order['invoice_id'])
    entity = await provider_request(c, 'GET', 'orders/'+data.provider_order_id)
    await attach_order(pool, token, order, invoice, entity)
    return {'status':'reconciled', 'mode':'TEST', 'message':'Order mapping recovered; capture webhook is still required'}


def verified_event(body, signature, c):
    if not signature or not re.fullmatch('[a-fA-F0-9]{64}', signature):
        raise HTTPException(401, 'Invalid webhook signature')
    expected = hmac.new(c.webhook_secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature.lower()): raise HTTPException(401, 'Invalid webhook signature')
    try:
        event = json.loads(body)
        if not isinstance(event, dict) or event.get('account_id') != c.account: raise ValueError()
        if event.get('event') not in ('payment.captured','order.paid'):
            raise HTTPException(422, 'Subscribe this endpoint only to payment.captured and order.paid')
        payment = event['payload']['payment']['entity']
        if (payment['entity'] != 'payment' or payment['status'] != 'captured' or payment['captured'] is not True
            or payment['currency'] != 'INR' or type(payment['amount']) is not int or not 100 <= payment['amount'] <= 100000000
            or not re.fullmatch(r'pay_[A-Za-z0-9]{1,80}', payment['id'])
            or not re.fullmatch(r'order_[A-Za-z0-9]{1,80}', payment['order_id'])): raise ValueError()
        return payment
    except (ValueError, KeyError, TypeError, RecursionError):
        raise HTTPException(422, 'Invalid captured payment event') from None


@router.post('/webhook')
async def webhook(request: Request, pool=Depends(get_db_pool)):
    c = config()
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 65536: raise HTTPException(413, 'Webhook exceeds 64 KiB')
    payment = verified_event(bytes(body), request.headers.get('x-razorpay-signature'), c)
    event_id = request.headers.get('x-razorpay-event-id', '')
    if not ID.fullmatch(event_id): raise HTTPException(422, 'Valid webhook event ID required')
    try:
        async with pool.acquire(timeout=5) as conn:
            async with conn.transaction():
                result = await conn.fetchval('SELECT erp_razorpay_capture($1,$2,$3,$4,$5,$6,$7,$8)',
                    c.tenant, c.account, payment['order_id'], payment['id'], payment['amount'], payment['currency'],
                    event_id, hashlib.sha256(body).hexdigest())
    except (asyncpg.RaiseError, asyncpg.UniqueViolationError):
        raise HTTPException(409, 'Payment requires reconciliation; no credit posted') from None
    return {'status':result, 'mode':'TEST'}
