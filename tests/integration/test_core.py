"""Real PostgreSQL + Redis acceptance tests; requires dedicated disposable services.
Never point DATABASE_ADMIN_URL at a real institution database.
"""
import asyncio
import os
import sys
import secrets
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import asyncpg
import pytest
import httpx

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'backend'))
sys.path.insert(0,str(ROOT/'backend/scripts'))
from migrate import migrate

@pytest.fixture(scope='module')
def seeded():
    url=os.getenv('DATABASE_ADMIN_URL')
    if not url: pytest.skip('Dedicated PostgreSQL integration service not configured')
    assert os.getenv('ERP_DISPOSABLE_TEST_DB')=='1', 'Explicit disposable database opt-in required'
    async def prepare():
        await migrate(url)
        await migrate(url)  # checksummed repeat must be safe
        conn=await asyncpg.connect(url)
        try:
            # CI creates a fresh database. Do not truncate or drop existing tables.
            assert await conn.fetchval('SELECT count(*) FROM tenants')==0
            await conn.execute("CREATE ROLE erp_test LOGIN PASSWORD 'integration-only' NOSUPERUSER NOBYPASSRLS INHERIT")
            await conn.execute('GRANT app_user TO erp_test')
            ids={k:uuid4() for k in ('tenant','other_tenant','faculty','parent','student_user','other_user','admin','section','course','slot','student','sibling','outsider','mark')}
            for tenant in [ids['tenant'],ids['other_tenant']]:
                await conn.execute("INSERT INTO tenants(tenant_id,name) VALUES($1,'Synthetic test institution')",tenant)
            for key,role,tenant in [('faculty','FACULTY','tenant'),('parent','PARENT','tenant'),('student_user','STUDENT','tenant'),('other_user','STUDENT','other_tenant'),('admin','INSTITUTION_ADMIN','tenant')]:
                await conn.execute("INSERT INTO users(user_id,tenant_id,role,first_name,last_name,email,password_hash) VALUES($1,$2,$3,'Test','User',$4,'disabled')",ids[key],ids[tenant],role,key+'@example.test')
            await conn.execute("INSERT INTO sections(section_id,tenant_id,name) VALUES($1,$2,'A')",ids['section'],ids['tenant'])
            await conn.execute("INSERT INTO master_data.courses(course_id,tenant_id,course_code,name,credits,course_type) VALUES($1,$2,'T101','Test',3,'CORE')",ids['course'],ids['tenant'])
            now=datetime.now(ZoneInfo('Asia/Kolkata'))
            start=now-timedelta(minutes=2)
            # Stable class window independent of when the CI worker starts.
            await conn.execute('INSERT INTO timetable_slots(slot_id,tenant_id,course_id,section_id,faculty_id,room_number,day_of_week,start_time,end_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',ids['slot'],ids['tenant'],ids['course'],ids['section'],ids['faculty'],'T1',now.strftime('%A'),start.time(),(now+timedelta(minutes=15)).time())
            for key,user,parent,tenant,section in [('student','student_user','parent','tenant','section'),('sibling',None,None,'tenant','section'),('outsider','other_user',None,'other_tenant',None)]:
                await conn.execute('INSERT INTO students(student_id,tenant_id,user_id,parent_id,section_id,first_name,last_name,enrollment_number) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',ids[key],ids[tenant],ids[user] if user else None,ids[parent] if parent else None,ids[section] if section else None,'Synthetic',key,key)
            await conn.execute("INSERT INTO exam_marks(mark_id,tenant_id,student_id,faculty_id,subject,marks_obtained,max_marks,exam_date) VALUES($1,$2,$3,$4,'Test',20,30,CURRENT_DATE)",ids['mark'],ids['tenant'],ids['student'],ids['faculty'])
            return ids
        finally: await conn.close()
    return asyncio.run(prepare())

async def context(conn,ids,role,user):
    await conn.execute("SELECT set_config('app.current_tenant_id',$1,true),set_config('app.current_user_id',$2,true),set_config('app.current_user_role',$3,true)",str(ids['tenant']),str(ids[user]),role)

@pytest.mark.parametrize('role,user,expected', [('STUDENT','student_user',['student']),('PARENT','parent',['student']),('FACULTY','faculty',['student','sibling']),('INSTITUTION_ADMIN','admin',['student','sibling'])])
def test_record_isolation_and_pool_reset(seeded,role,user,expected):
    async def run():
        conn=await asyncpg.connect(os.environ['DATABASE_URL'])
        try:
            async with conn.transaction():
                await context(conn,seeded,role,user)
                rows=await conn.fetch('SELECT student_id FROM students')
                assert {r['student_id'] for r in rows}=={seeded[k] for k in expected}
            assert await conn.fetchval('SELECT count(*) FROM students')==0
        finally: await conn.close()
    asyncio.run(run())

def test_unpublished_grades_and_audit_privileges(seeded):
    async def run():
        conn=await asyncpg.connect(os.environ['DATABASE_URL'])
        try:
            async with conn.transaction():
                await context(conn,seeded,'STUDENT','student_user')
                assert await conn.fetchval('SELECT count(*) FROM exam_marks')==0
            with pytest.raises(asyncpg.InsufficientPrivilegeError): await conn.fetch('SELECT * FROM audit_logs')
            with pytest.raises(asyncpg.InsufficientPrivilegeError): await conn.fetch('SELECT password_hash FROM users')
        finally: await conn.close()
    asyncio.run(run())

def test_database_rejects_cross_tenant_reference_and_invalid_mark(seeded):
    async def run():
        conn=await asyncpg.connect(os.environ['DATABASE_ADMIN_URL'])
        try:
            with pytest.raises(asyncpg.ForeignKeyViolationError):
                await conn.execute('UPDATE students SET parent_id=$1 WHERE student_id=$2',seeded['other_user'],seeded['student'])
            with pytest.raises(asyncpg.CheckViolationError):
                await conn.execute('UPDATE exam_marks SET marks_obtained=31 WHERE mark_id=$1',seeded['mark'])
        finally: await conn.close()
    asyncio.run(run())

def test_authenticated_api_workflows_and_refresh_replay(seeded):
    async def run():
        from app.main import app
        from app.core.auth import issue_session
        from app.core.redis import redis_manager
        from app.core.security import decode_token
        from starlette.responses import Response
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='https://erp.example.test',headers={'Origin':os.environ['FRONTEND_URL']}) as client:
                assert (await client.get('/health')).status_code==200
                assert (await client.get('/api/v1/students')).status_code==401
                response=Response()
                await issue_session({'user_id':seeded['faculty'],'tenant_id':seeded['tenant'],'role':'FACULTY'},response,redis_manager.client)
                for cookie in response.headers.getlist('set-cookie'):
                    name,value=cookie.split(';')[0].split('=',1);client.cookies.set(name,value)
                assert (await client.get('/api/v1/auth/me')).json()['role']=='FACULTY'
                slots=await client.get('/api/v1/timetable/my-slots')
                assert slots.status_code==200,slots.text
                assert slots.json()[0]['id']==str(seeded['slot'])
                payload={'slotId':str(seeded['slot']),'date':datetime.now(ZoneInfo('Asia/Kolkata')).date().isoformat(),'records':[{'studentId':str(seeded['student']),'status':'PRESENT'}]}
                results=await asyncio.gather(*[client.post('/api/v1/attendance/roster',json=payload) for _ in range(2)])
                assert sorted(r.status_code for r in results)==[200,409],[(r.status_code,r.text) for r in results]
                assert (await client.put(f"/api/v1/exams/marks/{seeded['mark']}",json={'marks_obtained':25})).status_code==200
                assert (await client.put(f"/api/v1/exams/marks/{seeded['mark']}",json={'marks_obtained':31})).status_code==422
                assert (await client.post(f"/api/v1/exams/marks/{seeded['mark']}/submit")).status_code==200
                assert (await client.put(f"/api/v1/exams/marks/{seeded['mark']}",json={'marks_obtained':26})).status_code==409
                original=next(c.value for c in client.cookies.jar if c.name=='refresh_token')
                refreshed=await client.post('/api/v1/auth/refresh')
                assert refreshed.status_code==200,refreshed.text
                # Replay from another client revokes even the newly rotated family.
                replay=await client.post('/api/v1/auth/refresh',headers={'Cookie':'refresh_token='+original})
                assert replay.status_code==401
                assert await redis_manager.client.get('session:'+decode_token(original,'refresh')['sid']) is None
                assert (await client.get('/api/v1/auth/me')).status_code==401
                assert (await client.post('/api/v1/auth/logout',headers={'Origin':'https://attacker.example'})).status_code==403
        admin=await asyncpg.connect(os.environ['DATABASE_ADMIN_URL'])
        try:
            assert await admin.fetchval('SELECT count(*) FROM attendance_records WHERE student_id=$1',seeded['student'])==1
            audit=await admin.fetchrow("SELECT performed_by,new_values FROM audit_logs WHERE table_name='exam_marks' AND action='UPDATE' AND new_values ? 'marks_obtained' ORDER BY timestamp DESC LIMIT 1")
            assert audit['performed_by']==seeded['faculty']
        finally: await admin.close()
    asyncio.run(run())

def test_3000_student_population_isolation(seeded):
    """Population correctness through real API; not a production throughput claim."""
    async def run():
        from app.main import app
        from app.core.security import create_access_token
        from app.core.redis import redis_manager
        tenant=uuid4()
        profiles=[(uuid4(),uuid4(),str(uuid4())) for _ in range(3000)]
        conn=await asyncpg.connect(os.environ['DATABASE_ADMIN_URL'])
        try:
            await conn.execute("INSERT INTO tenants(tenant_id,name) VALUES($1,'Synthetic population 3000')",tenant)
            async with conn.transaction():
                await conn.executemany("INSERT INTO users(user_id,tenant_id,role,first_name,last_name,email,password_hash) VALUES($1,$2,'STUDENT','Synthetic','User',$3,'disabled')",[(u,tenant,f'{u}@example.test') for u,s,sid in profiles])
                await conn.executemany("INSERT INTO students(student_id,tenant_id,user_id,first_name,last_name,enrollment_number) VALUES($1,$2,$3,'Synthetic','Student',$4)",[(s,tenant,u,str(s)) for u,s,sid in profiles])
            assert await conn.fetchval('SELECT count(*) FROM students WHERE tenant_id=$1',tenant)==3000
        finally: await conn.close()
        async with app.router.lifespan_context(app):
            async with redis_manager.client.pipeline(transaction=False) as pipe:
                for user,student,sid in profiles: pipe.set('session:'+sid,str(user),ex=600)
                await pipe.execute()
            limiter=asyncio.Semaphore(30)
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='https://erp.example.test') as client:
                async def read(profile):
                    user,student,sid=profile
                    token=create_access_token({'sub':str(user),'tenant_id':str(tenant),'role':'STUDENT','sid':sid})
                    async with limiter:
                        response=await client.get('/api/v1/students',headers={'Cookie':'access_token='+token})
                    assert response.status_code==200,response.text
                    assert [r['student_id'] for r in response.json()]==[str(student)]
                await asyncio.gather(*(read(p) for p in profiles))
    asyncio.run(run())

def test_academic_setup_enrollment_and_result_publication(seeded):
    async def run():
        from app.main import app
        from app.core.auth import issue_session
        from app.core.redis import redis_manager
        from starlette.responses import Response
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='https://erp.example.test',headers={'Origin':os.environ['FRONTEND_URL']}) as client:
                async def identity(user,role):
                    client.cookies.clear();response=Response()
                    await issue_session({'user_id':seeded[user],'tenant_id':seeded['tenant'],'role':role},response,redis_manager.client)
                    for cookie in response.headers.getlist('set-cookie'):
                        name,value=cookie.split(';')[0].split('=',1);client.cookies.set(name,value)
                await identity('student_user','STUDENT')
                assert (await client.post('/api/v1/timetable/sections',json={'name':'Unauthorized'})).status_code==403
                await identity('admin','INSTITUTION_ADMIN')
                assert (await client.post('/api/v1/timetable/sections',json={'name':'New section'})).status_code==201
                assert (await client.post('/api/v1/timetable/sections',json={'name':'New section'})).status_code==409
                assert (await client.post('/api/v1/timetable/courses',json={'course_code':'NEW101','name':'New course','credits':3})).status_code==201
                student={'first_name':'Admitted','last_name':'Student','enrollment_number':'NEW001','section_id':str(seeded['section'])}
                assert (await client.post('/api/v1/students',json={**student,'user_id':str(seeded['faculty'])})).status_code==422
                assert (await client.post('/api/v1/students',json={**student,'parent_id':str(seeded['other_user'])})).status_code==422
                assert (await client.post('/api/v1/students',json=student)).status_code==201
                assert (await client.post('/api/v1/students',json=student)).status_code==409
                payload={'section_id':str(seeded['section']),'course_id':str(seeded['course']),'faculty_id':str(seeded['faculty']),'name':'Integration exam','exam_date':datetime.now(ZoneInfo('Asia/Kolkata')).date().isoformat(),'max_marks':30}
                created=await client.post('/api/v1/exams/schedules',json=payload)
                assert created.status_code==201,created.text
                schedule=created.json()['schedule_id']
                assert (await client.post('/api/v1/exams/schedules',json=payload)).status_code==409
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/publish')).status_code==409
                await identity('faculty','FACULTY')
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/submit')).status_code==409
                marks=(await client.get('/api/v1/exams/marks')).json()
                ours=[m for m in marks if m['subject']=='Integration exam'];assert len(ours)==3
                for mark in ours:
                    assert mark['is_entered'] is False
                    assert (await client.put(f"/api/v1/exams/marks/{mark['id']}",json={'marks_obtained':23})).status_code==200
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/submit')).status_code==200
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/approve')).status_code==403
                await identity('student_user','STUDENT')
                assert not any(m['subject']=='Integration exam' for m in (await client.get('/api/v1/students/records')).json()['marks'])
                await identity('admin','INSTITUTION_ADMIN')
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/publish')).status_code==409
                approved=await client.post(f'/api/v1/exams/schedules/{schedule}/approve');assert approved.status_code==200,approved.text
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/publish')).status_code==200
                assert (await client.post(f'/api/v1/exams/schedules/{schedule}/publish')).status_code==200
                await identity('student_user','STUDENT')
                published=(await client.get('/api/v1/students/records')).json()['marks']
                assert len([m for m in published if m['subject']=='Integration exam'])==1
                await identity('faculty','FACULTY')
                assert (await client.put(f"/api/v1/exams/marks/{ours[0]['id']}",json={'marks_obtained':24})).status_code==409
    asyncio.run(run())


def test_razorpay_sandbox_isolation_durability_and_replays(seeded, monkeypatch):
    import hashlib, hmac, json
    from app.finance import razorpay
    from fastapi import HTTPException
    for key,value in {'RAZORPAY_ENABLED':'true','RAZORPAY_TENANT_ID':str(seeded['tenant']),
        'RAZORPAY_ACCOUNT_ID':'acc_Integration','RAZORPAY_KEY_ID':'rzp_test_Integration',
        'RAZORPAY_KEY_SECRET':'test-secret-not-a-real-key', 'RAZORPAY_WEBHOOK_SECRET':'test-webhook-secret-never-a-real-secret'}.items():
        monkeypatch.setenv(key,value)
    calls=[]; entities={}; uncertain=False
    async def provider(c,method,path,payload=None):
        if method=='GET': return entities[path.split('/')[-1]]
        calls.append(payload)
        entity={'id':'order_'+str(len(calls)), 'entity':'order', 'status':'created', **payload}
        entities[entity['id']]=entity
        if uncertain: raise HTTPException(503,'Synthetic uncertain provider result')
        await asyncio.sleep(.05)
        return entity
    monkeypatch.setattr(razorpay,'provider_request',provider)
    async def run():
        nonlocal uncertain
        from app.main import app
        from app.core.auth import issue_session
        from app.core.redis import redis_manager
        from starlette.responses import Response
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='https://erp.example.test',headers={'Origin':os.environ['FRONTEND_URL']}) as client:
                async def identity(user,role):
                    client.cookies.clear();response=Response()
                    await issue_session({'user_id':seeded[user],'tenant_id':seeded['tenant'],'role':role},response,redis_manager.client)
                    for cookie in response.headers.getlist('set-cookie'):
                        name,value=cookie.split(';')[0].split('=',1);client.cookies.set(name,value)
                path='/api/v1/finance/razorpay'
                data={'student_id':str(seeded['student']),'reference':'Sandbox tuition','amount_paise':25000}
                await identity('student_user','STUDENT')
                assert (await client.post(path+'/invoices',json=data)).status_code==403
                await identity('admin','INSTITUTION_ADMIN')
                assert (await client.post(path+'/invoices',json={**data,'student_id':str(seeded['outsider'])})).status_code==422
                invoice=await client.post(path+'/invoices',json=data);assert invoice.status_code==201,invoice.text
                invoice_id=invoice.json()['invoice_id']
                assert (await client.post(path+'/invoices',json=data)).status_code==409
                sibling=await client.post(path+'/invoices',json={**data,'student_id':str(seeded['sibling']),'reference':'Sibling sandbox'})
                assert sibling.status_code==201
                await identity('faculty','FACULTY')
                assert (await client.get(path+'/invoices')).json()==[]
                await identity('student_user','STUDENT')
                assert len((await client.get(path+'/invoices')).json())==1
                assert (await client.post(path+f"/invoices/{sibling.json()['invoice_id']}/order")).status_code==404
                results=await asyncio.gather(*(client.post(path+f'/invoices/{invoice_id}/order') for _ in range(5)))
                assert all(r.status_code in (200,409) for r in results),[(r.status_code,r.text) for r in results]
                assert sum(r.status_code==200 for r in results)>=1 and len(calls)==1
                assert calls[0]['amount']==25000 and calls[0]['currency']=='INR'
                await identity('parent','PARENT')
                assert (await client.post(path+f'/invoices/{invoice_id}/order')).json()['order_id']=='order_1'
                # No caller-supplied amount, payment ID or success flag can post credit.
                await identity('admin','INSTITUTION_ADMIN')
                second=await client.post(path+'/invoices',json={**data,'reference':'Timeout recovery'})
                second_id=second.json()['invoice_id']
                await identity('student_user','STUDENT');uncertain=True
                assert (await client.post(path+f'/invoices/{second_id}/order')).status_code==503
                assert (await client.post(path+f'/invoices/{second_id}/order')).status_code==409
                assert len(calls)==2
                reserved=next(r for r in (await client.get(path+'/invoices')).json() if r['invoice_id']==second_id)
                await identity('admin','INSTITUTION_ADMIN')
                assert (await client.post(path+f"/orders/{reserved['order_id']}/reconcile",json={'provider_order_id':'order_1'})).status_code==409
                recovered=await client.post(path+f"/orders/{reserved['order_id']}/reconcile",json={'provider_order_id':'order_2'})
                assert recovered.status_code==200,recovered.text
                assert len(calls)==2
                client.cookies.clear()
                payment={'entity':'payment','id':'pay_1','order_id':'order_1','status':'captured','captured':True,'amount':25000,'currency':'INR'}
                def signed(payment,event='evt_1'):
                    body=json.dumps({'event':'payment.captured','account_id':'acc_Integration','payload':{'payment':{'entity':payment}}}).encode()
                    headers={'x-razorpay-signature':hmac.new(os.environ['RAZORPAY_WEBHOOK_SECRET'].encode(),body,hashlib.sha256).hexdigest(),
                        'x-razorpay-event-id':event,'Content-Type':'application/json','Origin':'https://provider.example'}
                    return {'content':body,'headers':headers}
                assert (await client.post(path+'/webhook',content=b'{}',headers={'Origin':'https://provider.example'})).status_code==401
                assert (await client.post(path+'/webhook',**signed({**payment,'amount':24000}))).status_code==409
                assert (await client.post(path+'/webhook',**signed({**payment,'captured':False}))).status_code==422
                assert (await client.post(path+'/webhook',**signed({**payment,'order_id':'order_Unknown'}))).status_code==409
                responses=await asyncio.gather(*(client.post(path+'/webhook',**signed(payment)) for _ in range(10)))
                assert all(r.status_code==200 for r in responses),[(r.status_code,r.text) for r in responses]
                assert sum(r.json()['status']=='posted' for r in responses)==1
                assert (await client.post(path+'/webhook',**signed(payment,'evt_2'))).json()['status']=='duplicate'
                assert (await client.post(path+'/webhook',**signed({**payment,'id':'pay_Double'},'evt_3'))).status_code==409
                assert (await client.post(path+'/webhook',**signed({**payment,'id':'pay_Double'},'evt_1'))).status_code==409
                await identity('student_user','STUDENT')
                assert (await client.post(path+f'/invoices/{invoice_id}/order')).status_code==409
                assert not (await client.get('/api/v1/students/records')).json()['fees'], 'Test payment changed real fees'
        owner=await asyncpg.connect(os.environ['DATABASE_ADMIN_URL'])
        try:
            assert await owner.fetchval('SELECT count(*) FROM finance_captures')==1
            assert await owner.fetchval('SELECT count(*) FROM finance_webhook_events')==2
            assert await owner.fetchval("SELECT count(*) FROM finance_invoices WHERE status='PAID'")==1
            with pytest.raises(asyncpg.RaiseError): await owner.execute('DELETE FROM finance_captures')
        finally: await owner.close()
        runtime=await asyncpg.connect(os.environ['DATABASE_URL'])
        try:
            assert await runtime.fetchval('SELECT count(*) FROM finance_invoices')==0
            async with runtime.transaction():
                await context(runtime,seeded,'STUDENT','student_user')
                with pytest.raises(asyncpg.InsufficientPrivilegeError): await runtime.execute('UPDATE finance_invoices SET amount_paise=1')
            with pytest.raises(asyncpg.InsufficientPrivilegeError): await runtime.fetch('SELECT * FROM finance_webhook_events')
        finally: await runtime.close()
    asyncio.run(run())
