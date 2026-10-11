import asyncio
import asyncpg

async def wipe_db():
    try:
        conn = await asyncpg.connect('postgresql://postgres@localhost:5432/klmce_erp')
        print("Connected to PostgreSQL.")
        
        # Truncate tables
        tables = [
            'users',
            'students',
            'attendance_records',
            'exam_marks',
            'fee_transactions'
        ]
        
        for table in tables:
            try:
                await conn.execute(f"TRUNCATE TABLE {table} CASCADE;")
                print(f"Truncated {table}")
            except Exception as e:
                print(f"Skipping {table}: {e}")
                
        await conn.close()
        print("Successfully wiped synthetic data.")
    except Exception as e:
        print(f"Failed to connect or wipe data: {e}")

if __name__ == "__main__":
    asyncio.run(wipe_db())
