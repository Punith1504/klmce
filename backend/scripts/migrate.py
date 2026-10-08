"""Apply the supported core schema once, atomically, with checksums.

Run with a migration-owner DATABASE_ADMIN_URL. The runtime must use a separate,
non-owner DATABASE_URL. Untracked existing schemas deliberately require review.
"""
import asyncio
import hashlib
import os
from pathlib import Path
import asyncpg

ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS = ['init_schema.sql', 'backend/db/migrations/001_master_data.sql',
              'backend/db/migrations/018_security_foundation.sql',
              'backend/db/migrations/019_academic_workflows.sql',
              'backend/db/migrations/020_identity_lookup.sql']

async def migrate(url):
    conn = await asyncpg.connect(url)
    try:
        async with conn.transaction():
            await conn.execute('SELECT pg_advisory_xact_lock(681230019)')
            tracked = await conn.fetchval("SELECT to_regclass('public.erp_schema_migrations')")
            existing = await conn.fetchval("SELECT to_regclass('public.students')")
            if existing and not tracked:
                raise RuntimeError('Existing untracked schema: restore a backup to staging and reconcile with the supported baseline before adopting migrations')
            await conn.execute('CREATE TABLE IF NOT EXISTS erp_schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())')
            for name in MIGRATIONS:
                sql = (ROOT / name).read_text()
                digest = hashlib.sha256(sql.encode()).hexdigest()
                old = await conn.fetchval('SELECT checksum FROM erp_schema_migrations WHERE name=$1', name)
                if old:
                    if old != digest: raise RuntimeError(f'Migration checksum changed: {name}')
                    continue
                # The runner owns the outer transaction, including schema metadata.
                if name.endswith('018_security_foundation.sql'):
                    sql = sql.replace('BEGIN;\n', '', 1).removesuffix('COMMIT;\n')
                await conn.execute(sql)
                await conn.execute('INSERT INTO erp_schema_migrations(name,checksum) VALUES($1,$2)',name,digest)
                print(f'Applied {name}')
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(migrate(os.environ['DATABASE_ADMIN_URL']))
