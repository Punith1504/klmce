import uuid
import boto3
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/lms", tags=["LMS Submissions"])

# Initialize Boto3 Client (S3/Cloudflare R2 compatible)
s3_client = boto3.client(
    's3',
    aws_access_key_id="MOCK_ACCESS_KEY",
    aws_secret_access_key="MOCK_SECRET_KEY",
    region_name="us-east-1"
)
BUCKET_NAME = "klmce-erp-lms-submissions"

# Strict upload policies
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", # DOCX
    "application/zip"
}
MAX_FILE_SIZE = 25 * 1024 * 1024 # 25 MB Limit

class UploadIntentRequest(BaseModel):
    file_name: str
    mime_type: str

class ConfirmSubmissionRequest(BaseModel):
    student_id: str
    s3_key: str
    mime_type: str

@router.post("/assignments/{assignment_id}/upload-url")
async def generate_presigned_upload(assignment_id: str, request: UploadIntentRequest, tenant_id: str = "mock-tenant"):
    """
    Direct-to-S3 Upload Strategy.
    Generates a cryptographically signed URL allowing the client to push files directly to S3.
    This bypasses the FastAPI server, preventing memory starvation on massive concurrent uploads.
    """
    if request.mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid MIME type. Only PDF, DOCX, and ZIP are allowed.")
        
    s3_key = f"tenants/{tenant_id}/assignments/{assignment_id}/{uuid.uuid4()}_{request.file_name}"
    
    try:
        # Generate presigned POST with highly restrictive cryptographic conditions
        presigned_data = s3_client.generate_presigned_post(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Fields={
                "Content-Type": request.mime_type
            },
            Conditions=[
                {"Content-Type": request.mime_type},
                ["content-length-range", 1, MAX_FILE_SIZE]
            ],
            ExpiresIn=300 # Strict 5-minute expiration window
        )
        return {"upload_url_data": presigned_data, "s3_key": s3_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assignments/{assignment_id}/confirm")
async def confirm_submission(assignment_id: str, request: ConfirmSubmissionRequest):
    """
    Called by the frontend after the direct-to-S3 upload succeeds.
    Enforces deadlines and dispatches asynchronous plagiarism scanning.
    """
    # 1. Fetch assignment config from DB (Mocked for logic demonstration)
    assignment_due_date = datetime(2026, 12, 1, tzinfo=timezone.utc)
    allow_late_submissions = False
    
    now = datetime.now(timezone.utc)
    status = "ON_TIME"
    
    # 2. Strict Deadline Enforcement
    if now > assignment_due_date:
        if not allow_late_submissions:
            raise HTTPException(
                status_code=403, 
                detail="The submission deadline has passed. Late submissions are locked."
            )
        status = "LATE"
        
    # 3. Insert into PostgreSQL lms.assignment_submissions
    submission_id = str(uuid.uuid4())
    
    # 4. Dispatch Asynchronous Plagiarism & Duplicate Task
    from app.lms.tasks import compute_document_hash_task
    # Offloads heavy hashing to Celery background workers
    compute_document_hash_task.delay(submission_id, request.s3_key, assignment_id)
    
    return {
        "message": "Submission accepted and locked.",
        "status": status,
        "submission_id": submission_id
    }
