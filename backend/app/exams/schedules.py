from datetime import date,datetime
from decimal import Decimal
from uuid import UUID
from zoneinfo import ZoneInfo
from typing import Literal
import asyncpg
from fastapi import APIRouter,Depends,HTTPException,Query
from pydantic import BaseModel,ConfigDict,Field
from app.core.database import get_db_connection
from app.core.dependencies import require_roles,Role
router=APIRouter()
ADMIN=require_roles(Role.SUPER_ADMIN,Role.INSTITUTION_ADMIN)
STAFF=require_roles(Role.SUPER_ADMIN,Role.INSTITUTION_ADMIN,Role.FACULTY)
class ScheduleCreate(BaseModel):
    model_config=ConfigDict(extra='forbid',str_strip_whitespace=True)
    section_id:UUID
    course_id:UUID
    faculty_id:UUID
    name:str=Field(min_length=2,max_length=100)
    exam_date:date
    max_marks:Decimal=Field(gt=0,le=999.99,max_digits=5,decimal_places=2)

@router.post('/schedules',status_code=201)
async def create_schedule(data:ScheduleCreate,token=Depends(ADMIN),conn=Depends(get_db_connection)):
    tenant=UUID(token['tenant_id'])
    if not await conn.fetchval("SELECT 1 FROM users WHERE tenant_id=$1 AND user_id=$2 AND role='FACULTY' AND is_active",tenant,data.faculty_id):raise HTTPException(422,'Active faculty required')
    if not await conn.fetchval('SELECT 1 FROM timetable_slots WHERE tenant_id=$1 AND faculty_id=$2 AND section_id=$3 AND course_id=$4',tenant,data.faculty_id,data.section_id,data.course_id):raise HTTPException(422,'Faculty must teach this course and section')
    students=await conn.fetch('SELECT student_id FROM students WHERE tenant_id=$1 AND section_id=$2 ORDER BY student_id LIMIT 201',tenant,data.section_id)
    if not 1<=len(students)<=200:raise HTTPException(422,'Section must contain between 1 and 200 students')
    try:
        schedule=await conn.fetchval('INSERT INTO exam_schedules(tenant_id,section_id,course_id,faculty_id,created_by,name,exam_date,max_marks) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING schedule_id',tenant,data.section_id,data.course_id,data.faculty_id,UUID(token['sub']),data.name,data.exam_date,data.max_marks)
        await conn.executemany("INSERT INTO exam_marks(tenant_id,student_id,faculty_id,subject,marks_obtained,max_marks,exam_date,schedule_id,is_entered) VALUES($1,$2,$3,$4,0,$5,$6,$7,false)",[(tenant,s['student_id'],data.faculty_id,data.name,data.max_marks,data.exam_date,schedule) for s in students])
    except asyncpg.UniqueViolationError:raise HTTPException(409,'This examination already exists') from None
    except asyncpg.ForeignKeyViolationError:raise HTTPException(422,'Invalid course, section or faculty') from None
    return {'schedule_id':str(schedule),'students':len(students)}

@router.get('/schedules')
async def schedules(token=Depends(STAFF),conn=Depends(get_db_connection),offset:int=Query(0,ge=0,le=100000)):
    return [dict(r) for r in await conn.fetch('''SELECT e.schedule_id::text,e.name,e.exam_date,e.max_marks,s.name AS section,c.course_code,
    count(m.mark_id) AS students,count(*) FILTER(WHERE m.is_entered) AS entered,
    count(*) FILTER(WHERE m.status='SUBMITTED') AS submitted,count(*) FILTER(WHERE m.status='LOCKED') AS approved,
    count(*) FILTER(WHERE m.status='PUBLISHED') AS published
    FROM exam_schedules e JOIN sections s USING(section_id) JOIN master_data.courses c USING(course_id)
    JOIN exam_marks m ON m.schedule_id=e.schedule_id WHERE e.tenant_id=$1
    GROUP BY e.schedule_id,s.name,c.course_code ORDER BY e.exam_date DESC,e.schedule_id LIMIT 100 OFFSET $2''',UUID(token['tenant_id']),offset)]

@router.post('/schedules/{schedule_id}/{operation}')
async def transition(schedule_id:UUID,operation:Literal['submit','approve','publish'],token=Depends(STAFF),conn=Depends(get_db_connection)):
    role=token['role'];tenant=UUID(token['tenant_id'])
    if (operation=='submit' and role!='FACULTY') or (operation!='submit' and role not in ('SUPER_ADMIN','INSTITUTION_ADMIN')):raise HTTPException(403,'Role not permitted')
    schedule=await conn.fetchrow('SELECT * FROM exam_schedules WHERE schedule_id=$1 AND tenant_id=$2 FOR UPDATE',schedule_id,tenant)
    if not schedule:raise HTTPException(404,'Exam not found')
    if operation=='submit' and str(schedule['faculty_id'])!=token['sub']:raise HTTPException(403,'Faculty not assigned')
    if operation!='submit' and str(schedule['faculty_id'])==token['sub']:raise HTTPException(403,'Independent administrator required')
    rows=await conn.fetch('SELECT mark_id,status,is_entered FROM exam_marks WHERE schedule_id=$1 AND tenant_id=$2 ORDER BY mark_id FOR UPDATE',schedule_id,tenant)
    if not rows or any(not r['is_entered'] for r in rows):raise HTTPException(409,'Every student must have an entered mark')
    before,after={'submit':('DRAFT','SUBMITTED'),'approve':('SUBMITTED','LOCKED'),'publish':('LOCKED','PUBLISHED')}[operation]
    # Repeated identical requests are harmless; mixed incomplete states fail atomically.
    accepted={before,after}
    if operation=='approve': accepted.add('PUBLISHED')
    if any(r['status'] not in accepted for r in rows):raise HTTPException(409,'Exam is not ready for this transition')
    if operation=='publish' and schedule['exam_date']>datetime.now(ZoneInfo('Asia/Kolkata')).date():raise HTTPException(409,'Cannot publish an examination before its date')
    await conn.execute('UPDATE exam_marks SET status=$1,revision_window_until=NULL WHERE schedule_id=$2 AND tenant_id=$3 AND status=$4',after,schedule_id,tenant,before)
    return {'status':after,'students':len(rows)}
