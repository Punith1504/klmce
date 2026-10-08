import hashlib
import hmac
import json
from dataclasses import replace
from uuid import uuid4
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from app.finance.razorpay import Config, Invoice, config, tenant_config, verified_event, validate_order

C = Config(uuid4(), 'acc_Sandbox', 'rzp_test_Sandbox', 's'*24, 'w'*40)


def event(**changes):
    payment = {'id':'pay_Test123', 'order_id':'order_Test123', 'entity':'payment', 'status':'captured',
               'captured':True, 'amount':10000, 'currency':'INR', **changes}
    return {'event':'payment.captured', 'account_id':C.account, 'payload':{'payment':{'entity':payment}}}


def signed(payload):
    body = json.dumps(payload).encode()
    return body, hmac.new(C.webhook_secret.encode(), body, hashlib.sha256).hexdigest()


def test_raw_body_signature_and_capture():
    body, signature = signed(event())
    assert verified_event(body, signature, C)['amount'] == 10000
    with pytest.raises(HTTPException) as exc: verified_event(body+b' ', signature, C)
    assert exc.value.status_code == 401


@pytest.mark.parametrize('signature', [None, '', '0'*64, 'non-ascii-☃'])
def test_signature_rejected(signature):
    with pytest.raises(HTTPException) as exc: verified_event(signed(event())[0], signature, C)
    assert exc.value.status_code == 401


@pytest.mark.parametrize('change', [{'amount':0}, {'amount':True}, {'amount':'10000'}, {'amount':10000.5},
    {'currency':'USD'}, {'captured':False}, {'status':'authorized'}, {'order_id':'../orders'}, {'id':'pay_/bad'}])
def test_invalid_captures(change):
    with pytest.raises(HTTPException) as exc: verified_event(*signed(event(**change)), C)
    assert exc.value.status_code == 422


def test_wrong_merchant_and_authorization_event():
    for payload in [{**event(), 'account_id':'acc_Other'}, {**event(), 'event':'payment.authorized'}]:
        with pytest.raises(HTTPException) as exc: verified_event(*signed(payload), C)
        assert exc.value.status_code == 422


@pytest.mark.parametrize('amount', [True, '100', 100.1, -1, 0, 100000001])
def test_invoice_money_is_bounded_integer_paise(amount):
    with pytest.raises(ValidationError): Invoice(student_id=uuid4(), reference='test', amount_paise=amount)


def test_config_cannot_enable_live_keys(monkeypatch):
    values = {'RAZORPAY_ENABLED':'true', 'RAZORPAY_TENANT_ID':str(C.tenant), 'RAZORPAY_ACCOUNT_ID':C.account,
              'RAZORPAY_KEY_ID':C.key_id, 'RAZORPAY_KEY_SECRET':C.secret, 'RAZORPAY_WEBHOOK_SECRET':C.webhook_secret}
    for k,v in values.items(): monkeypatch.setenv(k,v)
    assert config() == C
    with pytest.raises(HTTPException): tenant_config({'tenant_id':str(uuid4())})
    monkeypatch.setenv('RAZORPAY_KEY_ID','rzp_live_Never')
    with pytest.raises(HTTPException) as exc: config()
    assert exc.value.status_code == 503


def test_order_receipt_and_server_amount_binding():
    order={'order_id':uuid4()}; invoice={'amount_paise':10000}
    entity={'id':'order_Valid', 'entity':'order', 'receipt':order['order_id'].hex,
            'amount':10000, 'currency':'INR', 'status':'created'}
    validate_order(entity, order, invoice)
    for change in [{'receipt':uuid4().hex}, {'amount':9999}, {'amount':10000.0}, {'partial_payment':True}]:
        with pytest.raises(HTTPException): validate_order({**entity, **change}, order, invoice)
