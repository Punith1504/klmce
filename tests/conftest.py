"""Ephemeral secrets for tests only; production never receives defaults."""
import os
import secrets
for key in ('SECRET_KEY','ATTENDANCE_AES_KEY','ATTENDANCE_HMAC_KEY','WEBHOOK_SECRET','PAYMENT_WEBHOOK_SECRET'):
    os.environ.setdefault(key,secrets.token_hex(32))
os.environ.setdefault('FRONTEND_URL','https://erp.example.test')
