#!/bin/bash
# ==============================================================================
# KLMCE ERP - Zero-Trust Disaster Recovery Pipeline
# ==============================================================================
# Strict bash settings: Fail on any error, fail on pipeline errors, prevent unbound variables
set -euo pipefail

# Configuration
DB_CONTAINER="klmce-postgres-1"   # Adjust based on your exact docker-compose service name
DB_USER="klmce_admin"
DB_NAME="klmce_erp"
S3_BUCKET="s3://klmce-production-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/tmp/klmce_db_backup_${TIMESTAMP}.sql.gz.enc"

echo "[*] Initializing Disaster Recovery Pipeline: $(date)"

# Ensure cryptographic keys are injected
if [ -z "${ENCRYPTION_PASSPHRASE:-}" ]; then
    echo "[FATAL] ENCRYPTION_PASSPHRASE environment variable is missing. Aborting."
    exit 1
fi

# ==========================================
# 1. Database Extraction & Cryptographic Sealing
# ==========================================
echo "[*] Triggering pg_dump, gzip compression, and AES-256-CBC encryption..."

# Pipeline Breakdown:
# 1. Exec into the running Postgres container and dump the raw SQL stream
# 2. Pipe into gzip for maximum compression (-9) without touching the disk
# 3. Pipe into openssl utilizing PBKDF2 key derivation for brute-force resistance
docker exec -i $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME | \
    gzip -9 | \
    openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -pass pass:"$ENCRYPTION_PASSPHRASE" -out "$BACKUP_FILE"

echo "[*] Cryptographic seal applied. Local archive generated: $BACKUP_FILE"

# ==========================================
# 2. Cloud Storage Synchronization
# ==========================================
echo "[*] Pushing encrypted archive to Remote Object Storage ($S3_BUCKET)..."

# NOTE: If using Cloudflare R2, append: --endpoint-url https://<account_id>.r2.cloudflarestorage.com
aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/klmce_db_backup_${TIMESTAMP}.sql.gz.enc" --quiet

# ==========================================
# 3. 30-Day Retention Policy Enforcement
# ==========================================
echo "[*] Enforcing 30-day strict retention policy on remote bucket..."

# Calculate the precise epoch cutoff for 30 days ago
CUTOFF_EPOCH=$(date -d "30 days ago" +%s)

# Stream the bucket contents and delete expired archives
aws s3 ls "$S3_BUCKET/" | while read -r line; do
    # AWS CLI outputs: "2026-09-30 02:00:00 123456 filename.enc"
    FILE_DATE=$(echo "$line" | awk '{print $1" "$2}')
    FILE_NAME=$(echo "$line" | awk '{print $4}')
    
    if [ -n "$FILE_NAME" ]; then
        FILE_EPOCH=$(date -d "$FILE_DATE" +%s)
        if [ "$FILE_EPOCH" -lt "$CUTOFF_EPOCH" ]; then
            echo "    -> Archiving limit exceeded. Shredding remote payload: $FILE_NAME"
            aws s3 rm "$S3_BUCKET/$FILE_NAME" --quiet
        fi
    fi
done

# ==========================================
# 4. Local Cleanup
# ==========================================
rm -f "$BACKUP_FILE"
echo "[*] Local artifacts shredded. Disaster Recovery Pipeline completed successfully."
