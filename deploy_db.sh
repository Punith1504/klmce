#!/usr/bin/env bash
# secure_db_init.sh
# Production PostgreSQL Initialization Script

set -e # Exit immediately if a command exits with a non-zero status
set -o pipefail # Fail a pipeline if any sub-command fails

# ==============================================================================
# Configuration Variables (Inject via CI/CD pipeline or environment)
# ==============================================================================
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-klmce_erp}"
SUPERUSER_NAME="${SUPERUSER_NAME:-postgres}"
# PGPASSWORD should be set in the environment for the superuser

APP_USER="app_user"
APP_USER_PASSWORD="${APP_USER_PASSWORD:-$(openssl rand -base64 32)}" # Auto-generate strong password if not provided
SCHEMA_FILE="init_schema.sql"

echo "======================================================="
echo " Starting Database Initialization for KLMCE ERP..."
echo " Target DB: $DB_NAME at $DB_HOST:$DB_PORT"
echo "======================================================="

# 1. Ensure the target database exists
echo "[1/4] Checking if database '$DB_NAME' exists..."
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$SUPERUSER_NAME" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "      Creating database '$DB_NAME'..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$SUPERUSER_NAME" -d postgres -c "CREATE DATABASE $DB_NAME;"
else
    echo "      Database '$DB_NAME' already exists."
fi

# 2. Execute the Core Schema (Multi-Tenant & RLS)
echo "[2/4] Applying schema from $SCHEMA_FILE..."
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "ERROR: Schema file $SCHEMA_FILE not found!"
    exit 1
fi
psql -h "$DB_HOST" -p "$DB_PORT" -U "$SUPERUSER_NAME" -d "$DB_NAME" -f "$SCHEMA_FILE"

# 3. Provision the Application Role
echo "[3/4] Configuring restricted '$APP_USER' role..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$SUPERUSER_NAME" -d "$DB_NAME" <<EOF
-- Ensure role exists and set login credentials for connection pooling (e.g., PgBouncer/FastAPI)
DO \$\$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$APP_USER') THEN
    CREATE ROLE $APP_USER WITH LOGIN PASSWORD '$APP_USER_PASSWORD';
  ELSE
    ALTER ROLE $APP_USER WITH LOGIN PASSWORD '$APP_USER_PASSWORD';
  END IF;
END
\$\$;

-- Grant connection and basic schema usage
GRANT CONNECT ON DATABASE $DB_NAME TO $APP_USER;
GRANT USAGE ON SCHEMA public TO $APP_USER;

-- Grant DML access on all current and future tables in public schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $APP_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $APP_USER;

-- Grant usage on all sequences (for UUIDs/Serials)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $APP_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO $APP_USER;
EOF

# 4. Enforce Immutability Constraints
echo "[4/4] Hardening audit log security..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$SUPERUSER_NAME" -d "$DB_NAME" <<EOF
-- EXPLICITLY revoke modification rights on the audit_logs table from the app_user
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM $APP_USER;

-- Ensure the app_user can ONLY insert and select from audit_logs
GRANT SELECT, INSERT ON audit_logs TO $APP_USER;
EOF

echo "======================================================="
echo " Database Initialization Complete!"
echo " APP_USER Password has been set securely."
echo " Save this password into your connection pool/FastAPI secret manager:"
echo " Password: \$APP_USER_PASSWORD"
echo "======================================================="
