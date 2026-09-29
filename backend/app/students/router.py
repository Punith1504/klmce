import csv
import io
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query
import asyncpg
from pydantic import ValidationError
from ..core.dependencies import get_db_connection, require_roles, Role
from ..core.security import RFC7807Exception
from .schemas import StudentCreate, StudentResponse, ParentAssignRequest

router = APIRouter(prefix="/api/v1/students", tags=["students"])

@router.post("", response_model=StudentResponse, status_code=201)
async def enroll_student(
    student: StudentCreate,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO students (tenant_id, parent_id, first_name, last_name, enrollment_number)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            """,
            uuid.UUID(token["tenant_id"]), student.parent_id, student.first_name, student.last_name, student.enrollment_number
        )
        return dict(row)
    except asyncpg.exceptions.UniqueViolationError:
        raise RFC7807Exception(
            status_code=409, type="probs/duplicate-enrollment", 
            title="Duplicate Enrollment", 
            detail=f"Student with enrollment number '{student.enrollment_number}' already exists in this tenant."
        )

@router.post("/bulk-upload", status_code=201)
async def bulk_upload_students(
    file: UploadFile = File(...),
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    if not file.filename.endswith('.csv'):
        raise RFC7807Exception(status_code=400, type="probs/invalid-file", title="Invalid File", detail="Only CSV files are allowed.")
    
    content = await file.read()
    text = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(text))
    
    tenant_id = uuid.UUID(token["tenant_id"])
    records = []
    
    # 1. Pydantic validation of all rows in memory
    for line_num, row_data in enumerate(reader, start=2):
        try:
            # Handle empty parent_id gracefully
            if not row_data.get('parent_id'):
                row_data['parent_id'] = None
            student_obj = StudentCreate(**row_data)
            records.append((
                tenant_id, 
                student_obj.parent_id, 
                student_obj.first_name, 
                student_obj.last_name, 
                student_obj.enrollment_number
            ))
        except ValidationError as e:
            raise RFC7807Exception(
                status_code=422, type="probs/csv-validation-error", 
                title="CSV Validation Error", 
                detail=f"Validation failed on line {line_num}: {e.errors()}"
            )

    # 2. Bulk Database Insert with Atomic Transaction
    # get_db_connection already starts a transaction for the request lifetime!
    # If any error occurs, the dependency will rollback the transaction automatically.
    try:
        await conn.executemany(
            """
            INSERT INTO students (tenant_id, parent_id, first_name, last_name, enrollment_number)
            VALUES ($1, $2, $3, $4, $5)
            """,
            records
        )
        return {"message": f"Successfully enrolled {len(records)} students."}
    except asyncpg.exceptions.UniqueViolationError:
        raise RFC7807Exception(
            status_code=409, type="probs/duplicate-enrollment", 
            title="Duplicate Enrollment", 
            detail="One or more enrollment numbers in the CSV already exist. The entire batch has been rolled back."
        )

@router.get("", response_model=List[StudentResponse])
async def list_students(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN, Role.FACULTY, Role.PARENT)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    # RLS natively isolates based on the tenant.
    # Furthermore, if role == PARENT, the parent_student_isolation policy physically 
    # restricts the resultset to only students where parent_id == current_user_id.
    rows = await conn.fetch("SELECT * FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2", limit, offset)
    return [dict(row) for row in rows]

@router.patch("/{student_id}/assign-parent", response_model=StudentResponse)
async def assign_parent(
    student_id: uuid.UUID,
    req: ParentAssignRequest,
    token: dict = Depends(require_roles(Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    # Validate the target parent_id is actually a user with the PARENT role
    user = await conn.fetchrow("SELECT role FROM users WHERE user_id = $1 AND tenant_id = $2", req.parent_id, uuid.UUID(token["tenant_id"]))
    if not user:
        raise RFC7807Exception(status_code=404, type="probs/parent-not-found", title="Not Found", detail="User not found.")
    if user["role"] != Role.PARENT.value:
        raise RFC7807Exception(status_code=400, type="probs/invalid-role", title="Invalid Role", detail="The specified user does not have the PARENT role.")

    # Apply the assignment. The audit_students_trigger tracks old_values and new_values automatically.
    row = await conn.fetchrow(
        "UPDATE students SET parent_id = $1 WHERE student_id = $2 RETURNING *",
        req.parent_id, student_id
    )
    if not row:
        raise RFC7807Exception(status_code=404, type="probs/student-not-found", title="Not Found", detail="Student not found.")
    
    return dict(row)
