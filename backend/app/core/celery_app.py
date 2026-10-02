import os
from celery import Celery
from kombu import Queue, Exchange
from celery.schedules import crontab

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery Worker using the existing Redis infrastructure
celery_app = Celery(
    "klmce_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.notifications", "app.core.siem_exporter", "app.finance.reconciliation"]
)

# ==========================================
# Task Routing & Queue Prioritization
# ==========================================
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # 1. Network Prioritization: Define physical queues
    task_queues=(
        Queue("high_priority", Exchange("high_priority"), routing_key="high_priority"),
        Queue("low_priority", Exchange("low_priority"), routing_key="low_priority"),
    ),
    task_default_queue="low_priority",
    
    # 2. Routing Rules: Ensure emergency alerts skip ahead of batch analytics
    task_routes={
        "app.tasks.notifications.send_absence_alert": {"queue": "high_priority"},
        "app.tasks.notifications.send_fee_reminders": {"queue": "low_priority"},
    }
)

# ==========================================
# CRON Beat Configuration
# ==========================================
celery_app.conf.beat_schedule = {
    # Fires every morning at 08:00 AM UTC to dispatch payment checkout links
    "daily-fee-reminders": {
        "task": "app.tasks.notifications.send_fee_reminders",
        "schedule": crontab(hour=8, minute=0),
    },
    # Batches and ships scrubbed audit logs to Datadog/Splunk every 5 minutes
    "siem-log-exporter": {
        "task": "app.core.siem_exporter.export_audit_logs_to_siem",
        "schedule": crontab(minute="*/5"),
    },
    # Analyzes Redis/Postgres telemetry for DDoS or IAM anomalies every 15 minutes
    "ids-anomaly-detection": {
        "task": "app.core.siem_exporter.intrusion_detection_heuristics",
        "schedule": crontab(minute="*/15"),
    },
    # Executes the core financial reconciliation and Stripe settlement checks nightly
    "nightly-financial-reconciliation": {
        "task": "app.finance.reconciliation.nightly_financial_reconciliation",
        "schedule": crontab(hour=23, minute=50),
    }
}
