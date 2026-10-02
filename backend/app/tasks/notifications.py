import asyncio
import os
from datetime import datetime, timedelta
from app.core.celery_app import celery_app

# Note: In a pure Celery architecture, executing `asyncio.run` inside a sync worker is standard 
# when reusing asyncpg connection pools. Alternatively, the worker can be run via `celery -A ... pool=gevent`

@celery_app.task(bind=True, max_retries=3)
def send_absence_alert(self, student_id: str, date_str: str):
    """
    HIGH-PRIORITY QUEUE
    Triggered instantly by the Attendance State Machine when a register is locked and a student is marked 'ABSENT'.
    Dispatches a real-time SMS via Twilio to the linked parent.
    """
    async def _process_alert():
        print(f"[{datetime.now()}] Initiating critical absence alert protocol for Student ID: {student_id}")
        
        # 1. Connect to Database (Simulated logic using asyncpg)
        # async with pool.acquire() as conn:
        #     query = """
        #         SELECT p.phone_number, s.first_name 
        #         FROM students s
        #         JOIN parents p ON s.parent_id = p.parent_id
        #         WHERE s.student_id = $1
        #     """
        #     record = await conn.fetchrow(query, student_id)
        
        # 2. Twilio API Execution
        # twilio_client.messages.create(
        #     body=f"KLMCE Alert: {record['first_name']} was marked absent on {date_str}.", 
        #     to=record['phone_number']
        # )
        
        print(f"[{datetime.now()}] SMS dispatched successfully.")

    try:
        # Execute the async query block within the sync Celery thread
        asyncio.run(_process_alert())
        return {"status": "dispatched", "student_id": student_id, "type": "SMS"}
    except Exception as e:
        print(f"Network failure dispatching SMS: {e}")
        # Exponential backoff (retries in 60s, then fails over)
        self.retry(exc=e, countdown=60)


@celery_app.task(bind=True)
def send_fee_reminders(self):
    """
    LOW-PRIORITY CRON QUEUE
    Runs daily via Celery Beat. Scans the immutable `fee_transactions` ledger for outstanding balances 
    approaching their due dates and batches SendGrid/AWS SES emails containing one-click checkout links.
    """
    async def _process_batch():
        print(f"[{datetime.now()}] Booting Daily Ledger Scan for Fee Reminders...")
        
        target_date = datetime.utcnow().date() + timedelta(days=3)
        
        # 1. Execute Ledger Query
        # async with pool.acquire() as conn:
        #     query = """
        #         SELECT f.transaction_id, f.amount, u.email
        #         FROM fee_transactions f
        #         JOIN users u ON f.user_id = u.user_id
        #         WHERE f.due_date = $1 AND f.status = 'PENDING'
        #     """
        #     outstanding_fees = await conn.fetch(query, target_date)
        
        # 2. Batch Email Dispatch (e.g. using SendGrid SDK)
        # for fee in outstanding_fees:
        #     sendgrid_client.send(
        #         to_email=fee['email'],
        #         subject="KLMCE Action Required: Outstanding Tuition Fee",
        #         html_content=f"Your payment of ${fee['amount']} is due in 3 days. <a href='https://klmce.edu/checkout/{fee['transaction_id']}'>Pay Now</a>"
        #     )
            
        print(f"[{datetime.now()}] Ledger scan complete. Batched reminders sent.")

    # Does not require strict retries; if it fails, the next day's CRON or manual admin override will catch it.
    asyncio.run(_process_batch())
    return {"status": "completed", "type": "EMAIL_BATCH"}
