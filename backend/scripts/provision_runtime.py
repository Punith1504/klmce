"""Provision a fixed least-privilege runtime login, using a migration connection."""
import asyncio
import os
import asyncpg

async def main():
    password=os.environ['ERP_DB_PASSWORD']
    if len(password)<24 or 'REPLACE' in password.upper(): raise ValueError('A generated runtime password of at least 24 characters is required')
    conn=await asyncpg.connect(os.environ['DATABASE_ADMIN_URL'])
    try:
        async with conn.transaction():
            # quote_literal is performed by PostgreSQL; no raw environment interpolation.
            literal=await conn.fetchval('SELECT quote_literal($1::text)',password)
            if not await conn.fetchval("SELECT 1 FROM pg_roles WHERE rolname='erp_runtime'"):
                await conn.execute('CREATE ROLE erp_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS INHERIT')
            await conn.execute('ALTER ROLE erp_runtime PASSWORD '+literal)
            await conn.execute('GRANT app_user TO erp_runtime')
            await conn.execute('REVOKE CREATE ON SCHEMA public FROM PUBLIC,app_user,erp_runtime')
    finally: await conn.close()

if __name__=='__main__': asyncio.run(main())
