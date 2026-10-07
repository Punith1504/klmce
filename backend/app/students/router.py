import csv
import json
import io
from uuid import UUID
from typing import Annotated
import asyncpg
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from pydantic import BaseModel, Field, ConfigDict, ValidationError
from app.core.database import get_db_connection
from app.core.dependencies import get_active_user, require_roles, Role

router=APIRouter()
ADMIN=require_roles(Role.INSTITUTION_ADMIN,Role.SUPER_ADMIN)
class StudentCreate(BaseModel):
    model_config=ConfigDict(str_strip_whitespace=True,extra='forbid')
    first_name:str=Field(min_length=1,max_length=100)
    last_name:str=Field(min_length=1,max_length=100)
    enrollment_number:str=Field(min_length=1,max_length=100)
    section_id:UUID|None=None
    user_id:UUID|None=None
    parent_id:UUID|None=None

@router.get('')
async def list_students(token:dict=Depends(get_active_user),conn=Depends(get_db_connection),
    limit:int=Query(100,ge=1,le=200),offset:int=Query(0,ge=0,le=100000)):
    args=[UUID(token['tenant_id']),limit,offset]
    ownership=''
    if token['role'] in ('STUDENT','PARENT'):
        column='user_id' if token['role']=='STUDENT' else 'parent_id'
        ownership=f' AND {column}=$4'
        args.append(UUID(token['sub']))
    rows=await conn.fetch('SELECT student_id::text, first_name,last_name,enrollment_number FROM students WHERE tenant_id=$1'+ownership+' ORDER BY enrollment_number,student_id LIMIT $2 OFFSET $3',*args)
    return [dict(row) for row in rows]

@router.post('',status_code=201)
async def create_student(data:StudentCreate,token:dict=Depends(ADMIN),conn=Depends(get_db_connection)):
    for user_id,role in [(data.user_id,'STUDENT'),(data.parent_id,'PARENT')]:
        if user_id and not await conn.fetchval('SELECT 1 FROM users WHERE tenant_id=$1 AND user_id=$2 AND role=$3 AND is_active',UUID(token['tenant_id']),user_id,role):
            raise HTTPException(422,'Linked account must be active, have the correct role, and belong to this institution')
    try:
        row=await conn.fetchrow('INSERT INTO students(tenant_id,first_name,last_name,enrollment_number,section_id,user_id,parent_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING student_id::text',
            UUID(token['tenant_id']),data.first_name,data.last_name,data.enrollment_number,data.section_id,data.user_id,data.parent_id)
    except asyncpg.UniqueViolationError: raise HTTPException(409,'Enrollment already exists') from None
    except asyncpg.ForeignKeyViolationError: raise HTTPException(422,'Section does not belong to this institution') from None
    return dict(row)

@router.post('/bulk')
async def bulk_upload_students(file:UploadFile=File(...),token:dict=Depends(ADMIN),conn=Depends(get_db_connection)):
    if not (file.filename or '').lower().endswith('.csv'): raise HTTPException(422,'CSV required')
    data=await file.read(2*1024*1024+1)
    if len(data)>2*1024*1024: raise HTTPException(413,'CSV exceeds 2 MiB')
    try:
        reader=csv.DictReader(io.StringIO(data.decode('utf-8-sig')))
        if not reader.fieldnames or not set(reader.fieldnames)<= {'first_name','last_name','enrollment_number','section_id'}:
            raise HTTPException(422,'Unsupported CSV columns')
        rows=[]
        for number,row in enumerate(reader,start=2):
            if number>5001: raise HTTPException(413,'At most 5000 records per import')
            if row.get('section_id')=='': row['section_id']=None
            item=StudentCreate(**row)
            rows.append((UUID(token['tenant_id']),item.first_name,item.last_name,item.enrollment_number,item.section_id))
    except (UnicodeError,csv.Error,ValidationError,TypeError): raise HTTPException(422,'Invalid CSV; use first_name,last_name,enrollment_number and optional section_id columns') from None
    if not rows: raise HTTPException(422,'No student records found')
    try:
        async with conn.transaction():
            await conn.executemany('INSERT INTO students(tenant_id,first_name,last_name,enrollment_number,section_id) VALUES($1,$2,$3,$4,$5)',rows)
    except asyncpg.UniqueViolationError: raise HTTPException(409,'Duplicate enrollment; import rolled back') from None
    except asyncpg.ForeignKeyViolationError: raise HTTPException(422,'Unknown section; import rolled back') from None
    return {'inserted_count':len(rows)}

@router.get('/records')
async def records(token:dict=Depends(get_active_user),conn=Depends(get_db_connection)):
    # RLS provides record-level ownership; explicit tenant predicate is defense in depth.
    tenant=UUID(token['tenant_id'])
    args=[tenant]
    scope=''
    if token['role'] in ('STUDENT','PARENT'):
        column='user_id' if token['role']=='STUDENT' else 'parent_id'
        scope=f' AND student_id IN (SELECT student_id FROM students WHERE {column}=$2 AND tenant_id=$1)'
        args.append(UUID(token['sub']))
    queries={
        'attendance':'SELECT student_id::text,date,status FROM attendance_records WHERE tenant_id=$1'+scope+' ORDER BY date DESC LIMIT 200',
        'marks':"SELECT mark_id::text,student_id::text,subject,marks_obtained::text,max_marks::text,exam_date,status FROM exam_marks WHERE tenant_id=$1 AND status='PUBLISHED'"+scope+' ORDER BY exam_date DESC LIMIT 200',
        'fees':'SELECT transaction_id::text,student_id::text,amount::text,payment_method,status,transaction_date FROM fee_transactions WHERE tenant_id=$1'+scope+' ORDER BY transaction_date DESC LIMIT 200',
    }
    # One statement also gives all three collections the same database snapshot.
    parts=[f"'{name}',(SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) FROM ({query}) r)" for name,query in queries.items()]
    return json.loads(await conn.fetchval('SELECT jsonb_build_object('+','.join(parts)+')',*args))


@router.get('/enrollment-options')
async def enrollment_options(q:str=Query('',max_length=80),token=Depends(ADMIN),conn=Depends(get_db_connection)):
    users=await conn.fetch("""SELECT user_id::text,first_name||' '||last_name AS name,role FROM users u
        WHERE tenant_id=$1 AND is_active AND role IN ('STUDENT','PARENT')
        AND (first_name||' '||last_name) ILIKE $2
        AND (role='PARENT' OR NOT EXISTS(SELECT 1 FROM students s WHERE s.user_id=u.user_id))
        ORDER BY role,first_name,last_name,user_id LIMIT 50""",UUID(token['tenant_id']),'%'+q+'%')
    return [dict(r) for r in users]
