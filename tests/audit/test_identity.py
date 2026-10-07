"""Signed identity-provider claim tests; no live Clerk account is needed."""
import asyncio
import json
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4
import pytest
from jose import jwt, jwk
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from fastapi import HTTPException
from app.core import identity

@pytest.fixture
def signer(monkeypatch):
    key=rsa.generate_private_key(public_exponent=65537,key_size=2048)
    private=key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption())
    public=key.public_key().public_bytes(serialization.Encoding.PEM,serialization.PublicFormat.SubjectPublicKeyInfo)
    data=jwk.construct(public,'RS256').to_dict();data['kid']='test-key'
    cache=SimpleNamespace(get=AsyncMock(return_value=json.dumps({'keys':[data]})),delete=AsyncMock())
    monkeypatch.setattr(identity,'get_redis_client',AsyncMock(return_value=cache))
    monkeypatch.setenv('CLERK_ISSUER','https://identity.example.test')
    monkeypatch.setenv('FRONTEND_URL','https://erp.example.test')
    monkeypatch.delenv('CLERK_AUDIENCE',raising=False)
    def sign(changes):
        claims={'sub':'user_test','iss':'https://identity.example.test','exp':datetime.now(timezone.utc)+timedelta(minutes=1),'azp':'https://erp.example.test','sid':'sess_test','v':2,'fva':[0,0]}
        claims.update(changes)
        return jwt.encode(claims,private,algorithm='RS256',headers={'kid':'test-key'})
    return sign

def test_valid_signed_identity_session(signer):
    assert asyncio.run(identity.verify_clerk_token(signer({})))['sub']=='user_test'

@pytest.mark.parametrize('changes',[{'iss':'https://attacker.example'},{'azp':'https://attacker.example'},{'sts':'pending'},{'act':{'sub':'actor'}},{'v':1},{'exp':0}])
def test_identity_claim_attacks_are_rejected(signer,changes):
    with pytest.raises(HTTPException) as error: asyncio.run(identity.verify_clerk_token(signer(changes)))
    assert error.value.status_code==401

def test_revision_window_cannot_bypass_submit_transition():
    from app.exams.decorators import validate_exam_state
    from app.exams.models import ExamStatus
    tenant,faculty=uuid4(),uuid4()
    mark=SimpleNamespace(tenant_id=tenant,faculty_id=faculty,status=ExamStatus.LOCKED,revision_window_until=datetime.now(timezone.utc)+timedelta(minutes=30))
    db=SimpleNamespace(get=AsyncMock(return_value=mark))
    handler=AsyncMock()
    call=validate_exam_state([ExamStatus.DRAFT])(handler)
    with pytest.raises(HTTPException) as error:
        asyncio.run(call(mark_id=uuid4(),db=db,token={'tenant_id':str(tenant),'sub':str(faculty),'role':'FACULTY'}))
    assert error.value.status_code==409
    handler.assert_not_awaited()

def test_revision_window_allows_assigned_faculty_mark_edit():
    from app.exams.decorators import validate_exam_state
    from app.exams.models import ExamStatus
    tenant,faculty=uuid4(),uuid4()
    mark=SimpleNamespace(tenant_id=tenant,faculty_id=faculty,status=ExamStatus.LOCKED,revision_window_until=datetime.now(timezone.utc)+timedelta(minutes=30))
    db=SimpleNamespace(get=AsyncMock(return_value=mark));handler=AsyncMock(return_value='updated')
    call=validate_exam_state([ExamStatus.DRAFT],allow_revision=True)(handler)
    assert asyncio.run(call(mark_id=uuid4(),db=db,token={'tenant_id':str(tenant),'sub':str(faculty),'role':'FACULTY'}))=='updated'
