from uuid import UUID
import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db_connection
from app.core.dependencies import require_roles, Role
from .schemas import TimetableSlotCreate
router=APIRouter()
STAFF=require_roles(Role.SUPER_ADMIN,Role.INSTITUTION_ADMIN,Role.FACULTY)
ADMIN=require_roles(Role.SUPER_ADMIN,Role.INSTITUTION_ADMIN)

@router.get('/courses')
async def list_courses(token:dict=Depends(STAFF),conn=Depends(get_db_connection)):
    return [dict(x) for x in await conn.fetch('SELECT course_id::text,course_code AS code,name FROM master_data.courses WHERE tenant_id=$1 ORDER BY course_code LIMIT 500',UUID(token['tenant_id']))]

@router.get('/faculty')
async def list_faculty(token:dict=Depends(ADMIN),conn=Depends(get_db_connection)):
    return [dict(x) for x in await conn.fetch("SELECT user_id::text,first_name,last_name FROM users WHERE tenant_id=$1 AND role='FACULTY' AND is_active ORDER BY last_name LIMIT 500",UUID(token['tenant_id']))]

@router.get('/my-slots')
async def my_slots(token:dict=Depends(require_roles(Role.FACULTY)),conn=Depends(get_db_connection)):
    slots=await conn.fetch('SELECT t.*,c.name AS course_name,c.course_code,s.name AS section_name FROM timetable_slots t JOIN master_data.courses c USING(course_id) JOIN sections s USING(section_id) WHERE t.tenant_id=$1 AND t.faculty_id=$2 ORDER BY t.day_of_week,t.start_time LIMIT 100',UUID(token['tenant_id']),UUID(token['sub']))
    result=[]
    for slot in slots:
        students=await conn.fetch('SELECT student_id::text AS id,enrollment_number AS "rollNo",first_name||\' \'||last_name AS name FROM students WHERE tenant_id=$1 AND section_id=$2 ORDER BY enrollment_number LIMIT 200',UUID(token['tenant_id']),slot['section_id'])
        result.append({'id':str(slot['slot_id']),'course':{'title':slot['course_name'],'code':slot['course_code']},'section':{'name':slot['section_name']},'dayOfWeek':slot['day_of_week'],'startTime':str(slot['start_time']),'endTime':str(slot['end_time']),'students':[dict(s) for s in students]})
    return result

@router.post('/slots',status_code=201)
async def assign_timetable_slot(payload:TimetableSlotCreate,token:dict=Depends(ADMIN),conn=Depends(get_db_connection)):
    if not await conn.fetchval("SELECT 1 FROM users WHERE tenant_id=$1 AND user_id=$2 AND role='FACULTY' AND is_active",UUID(token['tenant_id']),payload.faculty_id):
        raise HTTPException(422,'Assigned faculty is not active in this institution')
    try:
        row=await conn.fetchrow('INSERT INTO timetable_slots(tenant_id,course_id,section_id,faculty_id,room_number,day_of_week,start_time,end_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING slot_id::text',UUID(token['tenant_id']),payload.course_id,payload.section_id,payload.faculty_id,payload.room_number,payload.day_of_week,payload.start_time,payload.end_time)
    except asyncpg.ExclusionViolationError: raise HTTPException(409,'Room, section or faculty scheduling conflict') from None
    except asyncpg.ForeignKeyViolationError: raise HTTPException(422,'Course, section or faculty does not belong to this institution') from None
    return dict(row)

from pydantic import BaseModel,Field,ConfigDict
from decimal import Decimal
from typing import Literal
class SectionCreate(BaseModel):
    model_config=ConfigDict(str_strip_whitespace=True,extra='forbid')
    name:str=Field(min_length=1,max_length=100)
class CourseCreate(BaseModel):
    model_config=ConfigDict(str_strip_whitespace=True,extra='forbid')
    course_code:str=Field(min_length=1,max_length=50,pattern=r'^[A-Z0-9_-]+$')
    name:str=Field(min_length=1,max_length=100)
    credits:Decimal=Field(ge=0,le=30,max_digits=3,decimal_places=1)
    course_type:Literal['CORE','ELECTIVE','LAB','PROJECT']='CORE'

@router.get('/sections')
async def list_sections(token=Depends(STAFF),conn=Depends(get_db_connection)):
    return [dict(r) for r in await conn.fetch('SELECT section_id::text,name FROM sections WHERE tenant_id=$1 ORDER BY name LIMIT 500',UUID(token['tenant_id']))]

@router.post('/sections',status_code=201)
async def create_section(data:SectionCreate,token=Depends(ADMIN),conn=Depends(get_db_connection)):
    try:
        result=await conn.fetchval('INSERT INTO sections(tenant_id,name) VALUES($1,$2) RETURNING section_id',UUID(token['tenant_id']),data.name)
    except asyncpg.UniqueViolationError:raise HTTPException(409,'Section already exists') from None
    return {'section_id':str(result)}

@router.post('/courses',status_code=201)
async def create_course(data:CourseCreate,token=Depends(ADMIN),conn=Depends(get_db_connection)):
    try:
        result=await conn.fetchval('INSERT INTO master_data.courses(tenant_id,course_code,name,credits,course_type) VALUES($1,$2,$3,$4,$5) RETURNING course_id',UUID(token['tenant_id']),data.course_code,data.name,data.credits,data.course_type)
    except asyncpg.UniqueViolationError:raise HTTPException(409,'Course code already exists') from None
    return {'course_id':str(result)}
