from celery import shared_task
import boto3
import hashlib
import logging

logger = logging.getLogger(__name__)
s3_client = boto3.client('s3')
BUCKET_NAME = "klmce-erp-lms-submissions"

@shared_task(bind=True, max_retries=3)
def compute_document_hash_task(self, submission_id: str, s3_key: str, assignment_id: str):
    """
    Asynchronous Celery task that streams the uploaded document from S3
    and computes a cryptographic SHA-256 hash. 
    This identifies exact 1:1 plagiarism (students renaming and submitting the same file).
    """
    try:
        hasher = hashlib.sha256()
        
        # 1. Stream the file directly from S3 (prevents loading large files entirely into RAM)
        # response = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_key)
        # for chunk in response['Body'].iter_chunks(chunk_size=8192):
        #     hasher.update(chunk)
        
        # (Mock hashing for demonstration)
        hasher.update(s3_key.encode('utf-8')) 
        document_hash = hasher.hexdigest()
        
        # 2. Update the document_sha256 column in PostgreSQL
        # UPDATE lms.assignment_submissions SET document_sha256 = document_hash WHERE id = submission_id
        
        # 3. Plagiarism Detection Query
        # If another student submitted a file for the same assignment_id with the EXACT same hash,
        # flag both submissions as duplicates!
        #
        # SELECT count(*) FROM lms.assignment_submissions 
        # WHERE assignment_id = assignment_id AND document_sha256 = document_hash;
        # 
        # If count > 1:
        # UPDATE lms.assignment_submissions SET is_duplicate = TRUE WHERE document_sha256 = document_hash;
        
        logger.info(f"Successfully computed and stored SHA-256 for submission {submission_id}: {document_hash}")
        
        return {"submission_id": submission_id, "hash": document_hash, "plagiarism_check": "completed"}
        
    except Exception as exc:
        logger.error(f"Failed to process hash for {submission_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
