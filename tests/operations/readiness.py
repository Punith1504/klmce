"""Disposable CI readiness drill. Real TCP/HTTP, PostgreSQL, Redis and pg_dump/restore.
No production URL is accepted. Credentials, dumps and encryption keys are not artifacts.
"""
import asyncio, hashlib, json, os, secrets, subprocess, sys, tempfile, time, resource
from pathlib import Path
from uuid import uuid4
from urllib.parse import urlsplit,urlunsplit
from datetime import datetime,timedelta,time as Clock
from zoneinfo import ZoneInfo
import asyncpg,httpx
import redis.asyncio as redis
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'backend'))
for key in ['SECRET_KEY','ATTENDANCE_AES_KEY','ATTENDANCE_HMAC_KEY']: os.environ[key]=secrets.token_hex(32)
os.environ['FRONTEND_URL']='https://erp.example.test'
from app.core.security import create_access_token
from app.attendance.qr_crypto import generate_qr_payload

REPORT={'environment':'disposable GitHub runner; loopback HTTP; not production certification'}

def command(*args,**kwargs):
    return subprocess.run(args,check=True,capture_output=True,**kwargs)

def stats(samples):
    ordered=sorted(samples)
    return {'requests':len(samples),'p50_ms':round(ordered[int((len(ordered)-1)*.50)],2),
        'p95_ms':round(ordered[int((len(ordered)-1)*.95)],2),'p99_ms':round(ordered[int((len(ordered)-1)*.99)],2)}

async def fingerprints(conn):
    result={}
    tables=await conn.fetch("SELECT schemaname,tablename FROM pg_tables WHERE schemaname IN ('public','master_data') ORDER BY 1,2")
    async with conn.transaction():
        for table in tables:
            schema,name=table['schemaname'],table['tablename']
            qualified='"'+schema+'"."'+name+'"'
            keys=await conn.fetch("SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey) WHERE i.indrelid=$1::regclass AND i.indisprimary ORDER BY a.attnum",qualified)
            order=','.join('"'+k['attname']+'"' for k in keys) or 'to_jsonb(t)::text'
            digest=hashlib.sha256();count=0
            async for row in conn.cursor(f'SELECT to_jsonb(t)::text AS body FROM {qualified} t ORDER BY {order}',prefetch=1000):
                digest.update(row['body'].encode()+b'\n');count+=1
            result[schema+'.'+name]={'rows':count,'sha256':digest.hexdigest()}
    return result

async def drill():
    assert os.getenv('ERP_DISPOSABLE_TEST_DB')=='1','Disposable database opt-in required'
    admin_url=os.environ['DATABASE_ADMIN_URL'];parsed=urlsplit(admin_url)
    assert parsed.hostname in ('localhost','127.0.0.1') and parsed.path=='/erp_test','Only local erp_test is supported'
    container=os.environ['ERP_TEST_POSTGRES_CONTAINER']
    assert container and all(c.isalnum() or c in '_-' for c in container)
    conn=await asyncpg.connect(admin_url)
    cache=redis.from_url(os.environ['REDIS_URL'],decode_responses=True)
    try:
        tenant=await conn.fetchval("SELECT tenant_id FROM tenants WHERE name='Synthetic population 3000'")
        assert tenant
        people=await conn.fetch('SELECT user_id,student_id FROM students WHERE tenant_id=$1 ORDER BY student_id',tenant)
        assert len(people)==3000
        # Two months of attendance and ten published assessments per student.
        await conn.execute("INSERT INTO attendance_records(tenant_id,student_id,date,status) SELECT $1,s.student_id,CURRENT_DATE-n,'PRESENT' FROM students s CROSS JOIN generate_series(1,60) n WHERE s.tenant_id=$1",tenant)
        await conn.execute("INSERT INTO exam_marks(tenant_id,student_id,subject,marks_obtained,max_marks,exam_date,status) SELECT $1,s.student_id,'Synthetic '||n,75,100,CURRENT_DATE-n,'PUBLISHED' FROM students s CROSS JOIN generate_series(1,10) n WHERE s.tenant_id=$1",tenant)
        faculty,course=uuid4(),uuid4()
        await conn.execute("INSERT INTO users(user_id,tenant_id,role,first_name,last_name,email,password_hash) VALUES($1,$2,'FACULTY','Synthetic','Faculty','faculty@load.example.test','disabled')",faculty,tenant)
        await conn.execute("INSERT INTO master_data.courses(course_id,tenant_id,course_code,name,credits,course_type) VALUES($1,$2,'LOAD','Synthetic load course',3,'CORE')",course,tenant)
        slots=[]
        now=datetime.now(ZoneInfo('Asia/Kolkata'))
        start=max(Clock(0), (now-timedelta(minutes=1)).time()) if now.hour else Clock(0)
        end=min(Clock(23,59,59),(now+timedelta(minutes=15)).time()) if now.hour<23 else Clock(23,59,59)
        for i in range(60):
            section,slot,teacher=uuid4(),uuid4(),uuid4()
            await conn.execute("INSERT INTO users(user_id,tenant_id,role,first_name,last_name,email,password_hash) VALUES($1,$2,'FACULTY','Synthetic','Faculty',$3,'disabled')",teacher,tenant,f'{teacher}@example.test')
            await conn.execute('INSERT INTO sections(section_id,tenant_id,name) VALUES($1,$2,$3)',section,tenant,f'Load {i}')
            await conn.execute('UPDATE students SET section_id=$1 WHERE student_id=ANY($2)',section,[p['student_id'] for p in people[i*50:(i+1)*50]])
            await conn.execute('INSERT INTO timetable_slots(slot_id,tenant_id,section_id,faculty_id,course_id,room_number,day_of_week,start_time,end_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',slot,tenant,section,teacher,course,str(i),now.strftime('%A'),start,end)
            slots.append(slot)
        profiles=[]
        async with cache.pipeline(transaction=False) as pipe:
            for i,p in enumerate(people):
                sid=str(uuid4());pipe.set('session:'+sid,str(p['user_id']),ex=900)
                profiles.append({'student':str(p['student_id']),'slot':slots[i//50],
                    'token':create_access_token({'sub':str(p['user_id']),'tenant_id':str(tenant),'role':'STUDENT','sid':sid})})
            await pipe.execute()
        REPORT['dataset']={'students':3000,'historical_attendance':180000,'published_marks':30000,'sections':60}
        await conn.execute('ANALYZE')
        # Diagnose the real restricted-role query, not an owner/RLS-bypass plan.
        restricted=await asyncpg.connect(os.environ['DATABASE_URL'])
        try:
            async with restricted.transaction():
                await restricted.execute("SELECT set_config('app.current_tenant_id',$1,true),set_config('app.current_user_id',$2,true),set_config('app.current_user_role','STUDENT',true)",str(tenant),str(people[0]['user_id']))
                plan=await restricted.fetch("EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT student_id::text,date,status FROM attendance_records WHERE tenant_id=$1 AND student_id IN (SELECT student_id FROM students WHERE user_id=$2 AND tenant_id=$1) ORDER BY date DESC LIMIT 200",tenant,people[0]['user_id'])
                REPORT['restricted_history_plan']=[r[0] for r in plan]
                print(json.dumps({'restricted_history_plan':REPORT['restricted_history_plan']}),flush=True)
        finally:await restricted.close()
        env={**os.environ,'PYTHONPATH':str(ROOT/'backend')}
        with open(ROOT/'operational-server.log','w') as log:
            server=subprocess.Popen([sys.executable,'-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8097','--workers','2','--no-access-log'],env=env,stdout=log,stderr=log)
            try:
                async with httpx.AsyncClient(base_url='http://127.0.0.1:8097',timeout=20,limits=httpx.Limits(max_connections=300,max_keepalive_connections=300)) as client:
                    for _ in range(100):
                        try:
                            if (await client.get('/health')).status_code==200:break
                        except httpx.HTTPError:pass
                        await asyncio.sleep(.1)
                    else:raise RuntimeError('Backend did not become ready')
                    for concurrency in (50,150,300):
                        latencies=[];errors=[];sem=asyncio.Semaphore(concurrency)
                        async def read(p):
                            async with sem:
                                before=time.perf_counter()
                                r=await client.get('/api/v1/students/records',headers={'Cookie':'access_token='+p['token']})
                                latencies.append((time.perf_counter()-before)*1000)
                                if r.status_code!=200:errors.append(r.status_code);return
                                body=r.json()
                                assert len(body['attendance'])==60 and len(body['marks'])==10
                                assert all(x['student_id']==p['student'] for kind in body.values() for x in kind),'Record disclosure'
                        before=time.perf_counter();await asyncio.gather(*(read(p) for p in profiles))
                        elapsed=time.perf_counter()-before
                        REPORT[f'reads_{concurrency}']={**stats(latencies),'errors':len(errors),'duration_seconds':round(elapsed,2),'requests_per_second':round(len(profiles)/elapsed,2)}
                        print(json.dumps({f'reads_{concurrency}':REPORT[f'reads_{concurrency}']}),flush=True)
                        assert not errors,'HTTP read errors'
                    # Fresh shared classroom QR for each of the 60 sections.
                    qr={slot:generate_qr_payload(str(tenant),str(slot),str(uuid4())) for slot in slots}
                    latencies=[];sem=asyncio.Semaphore(300)
                    async def scan(p):
                        async with sem:
                            before=time.perf_counter()
                            r=await client.post('/api/v1/attendance/scan',json={'qr_payload':qr[p['slot']]},headers={'Cookie':'access_token='+p['token'],'Origin':os.environ['FRONTEND_URL']})
                            latencies.append((time.perf_counter()-before)*1000)
                            assert r.status_code==200,f'Attendance failed: {r.status_code}'
                    before=time.perf_counter();await asyncio.gather(*(scan(p) for p in profiles))
                    REPORT['attendance_burst']={**stats(latencies),'duration_seconds':round(time.perf_counter()-before,2)}
                    assert await conn.fetchval('SELECT count(*) FROM attendance_records WHERE tenant_id=$1 AND slot_id=ANY($2)',tenant,slots)==3000
                    # Replay same valid code for first 100 identities: durable duplicate protection.
                    await asyncio.gather(*(scan(p) for p in profiles[:100]))
                    assert await conn.fetchval('SELECT count(*) FROM attendance_records WHERE tenant_id=$1 AND slot_id=ANY($2)',tenant,slots)==3000
                    REPORT['attendance_burst']['rows']=3000;REPORT['attendance_burst']['duplicate_replays']=100
                    REPORT['latency_budget_met']=all(REPORT[f'reads_{n}']['p95_ms']<1500 and REPORT[f'reads_{n}']['p99_ms']<3000 for n in (50,150,300))
            finally:
                server.terminate()
                try:server.wait(timeout=15)
                except subprocess.TimeoutExpired:server.kill();server.wait()
        REPORT['backend_peak_child_rss_kib']=resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
        before_snapshot=await fingerprints(conn)
        backup_start=time.perf_counter()
        dumped=command('docker','exec',container,'pg_dump','-U','postgres','-Fc','erp_test').stdout
        key=AESGCM.generate_key(bit_length=256);nonce=os.urandom(12)
        encrypted=AESGCM(key).encrypt(nonce,dumped,b'klmce-ci-restore-v1');del dumped
        restore_db='erp_restore_'+uuid4().hex
        await conn.execute('CREATE DATABASE '+restore_db)
        try:
            restored_bytes=AESGCM(key).decrypt(nonce,encrypted,b'klmce-ci-restore-v1')
            command('docker','exec','-i',container,'pg_restore','-U','postgres','--exit-on-error','-d',restore_db,input=restored_bytes)
            del restored_bytes,key
            restored_url=urlunsplit(parsed._replace(path='/'+restore_db))
            restored=await asyncpg.connect(restored_url)
            try:
                assert await fingerprints(restored)==before_snapshot,'Restored data differs'
                assert await restored.fetchval("SELECT relforcerowsecurity FROM pg_class WHERE oid='students'::regclass")
            finally:await restored.close()
            runtime=urlsplit(os.environ['DATABASE_URL']);restricted=await asyncpg.connect(urlunsplit(runtime._replace(path='/'+restore_db)))
            try:
                assert await restricted.fetchval('SELECT count(*) FROM students')==0
                async with restricted.transaction():
                    await restricted.execute("SELECT set_config('app.current_tenant_id',$1,true),set_config('app.current_user_id',$2,true),set_config('app.current_user_role','STUDENT',true)",str(tenant),str(people[0]['user_id']))
                    assert await restricted.fetchval('SELECT count(*) FROM students')==1
                    assert await restricted.fetchval('SELECT count(*) FROM attendance_records')==61
                try:await restricted.fetch('SELECT * FROM audit_logs')
                except asyncpg.InsufficientPrivilegeError:pass
                else:raise AssertionError('Restore weakened audit privileges')
            finally:await restricted.close()
            REPORT['backup_restore']={'encrypted_bytes':len(encrypted),'round_trip_seconds':round(time.perf_counter()-backup_start,2),'verified_tables':len(before_snapshot),'row_counts_and_sha256_match':True,'restored_rls_and_privileges_verified':True}
        finally:await conn.execute('DROP DATABASE '+restore_db) # only the isolated drill database created above
        print(json.dumps(REPORT),flush=True)
        assert REPORT['latency_budget_met'],'Measured CI read latency exceeds proposed budget; investigate before release'
    finally:
        await cache.aclose();await conn.close()

if __name__=='__main__':
    try:asyncio.run(drill());REPORT['result']='passed'
    except BaseException as error:
        REPORT['result']='failed';REPORT['failure_type']=type(error).__name__;raise
    finally:(ROOT/'operational-results.json').write_text(json.dumps(REPORT,indent=2)+'\n')
