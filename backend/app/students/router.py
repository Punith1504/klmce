from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel, ValidationError
from typing import List
import asyncpg
import csv
import codecs
from app.core.database import get_db_connection
from app.core.security import RFC7807Exception

router = APIRouter()

# ==========================================
# Schemas
# ==========================================
class StudentResponse(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    enrollment_number: str

class StudentBulkCreate(BaseModel):
    first_name: str
    last_name: str
    enrollment_number: str

# ==========================================
# Endpoints
# ==========================================
@router.get("", response_model=List[StudentResponse])
async def list_students(conn: asyncpg.Connection = Depends(get_db_connection)):
    """
    Retrieve all students authorized for the current session.
    
    SECURITY NOTE: 
    There is intentionally NO `WHERE tenant_id = X` or `WHERE parent_id = Y` clause in this query.
    The PostgreSQL Row-Level Security (RLS) context injected by the database middleware mathematically 
    forces the database engine to strip out any rows the requesting user is not authorized to see, 
    preventing application-layer bugs from leaking multi-tenant data.
    """
    query = """
        SELECT 
            student_id::text, 
            first_name, 
            last_name, 
            enrollment_number 
        FROM students
        ORDER BY last_name ASC
    """
    
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

@router.post("/bulk")
async def bulk_upload_students(
    file: UploadFile = File(...),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Stream processes large CSV files to prevent memory exhaustion on massive institutional rosters.
    Executes an atomic asyncpg transaction to ensure an all-or-nothing rollback on validation failure.
    """
    if not file.filename.endswith('.csv'):
        raise RFC7807Exception(
            status_code=400,
            type="probs/invalid-file-type",
            title="Invalid File Format",
            detail="The uploaded file must be a standard CSV."
        )

    parsed_records = []
    validation_errors = []

    # Stream the file in chunks utilizing codecs to parse bytes directly into UTF-8 lines
    # This prevents the server from loading a 500MB CSV entirely into RAM.
    try:
        csv_reader = csv.DictReader(codecs.iterdecode(file.file, 'utf-8'))
        
        for row_number, row in enumerate(csv_reader, start=2): # Start at 2 to account for header
            try:
                # Pydantic explicitly validates the row structure
                student = StudentBulkCreate(**row)
                parsed_records.append((student.first_name, student.last_name, student.enrollment_number))
            except ValidationError as e:
                validation_errors.append({
                    "row": row_number,
                    "errors": str(e)
                })
    except Exception as e:
        raise RFC7807Exception(
            status_code=400,
            type="probs/csv-parse-fatal",
            title="Fatal CSV Parsing Error",
            detail="The file stream could not be decoded. Ensure it is a valid UTF-8 CSV."
        )
        
    # Phase 2: Halt execution and report exact coordinates of formatting failures
    if validation_errors:
        raise RFC7807Exception(
            status_code=422,
            type="probs/bulk-validation-failed",
            title="CSV Validation Failed",
            detail=f"Found {len(validation_errors)} formatting errors. The entire batch was rejected. Example failure on row {validation_errors[0]['row']}."
        )
        
    # Phase 3: Atomic Database Execution
    # If a single row violates a database constraint (e.g., duplicated enrollment_number),
    # PostgreSQL instantly rolls back the entire batch, keeping the database perfectly synchronized.
    try:
        async with conn.transaction():
            query = """
                INSERT INTO students (first_name, last_name, enrollment_number)
                VALUES ($1, $2, $3)
            """
            await conn.executemany(query, parsed_records)
            
    except asyncpg.exceptions.UniqueViolationError:
        raise RFC7807Exception(
            status_code=409,
            type="probs/bulk-collision",
            title="Database Conflict",
            detail="One or more enrollment numbers in the CSV already exist in the system. The transaction has been safely rolled back."
        )

    return {
        "status": "success", 
        "inserted_count": len(parsed_records),
        "message": "Institutional roster synchronized successfully."
    }
