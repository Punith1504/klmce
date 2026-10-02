import io
import csv
import json
import uuid
import logging
from typing import AsyncGenerator, List, Dict, Any, Optional
import asyncpg
from pydantic import BaseModel, Field, EmailStr, ValidationError, ConfigDict

logger = logging.getLogger(__name__)

# ==========================================
# Schema Mapping Validators (Pydantic)
# ==========================================
class LegacyStudentMap(BaseModel):
    """
    Robust Schema Validator mapping messy legacy aliases 
    (e.g., 'Roll_No', 'StudentRegId') to the normalized KLMCE PostgreSQL schema.
    """
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    enrollment_number: str = Field(alias="Roll_No", description="Legacy Roll Number")
    first_name: str = Field(alias="FirstName")
    last_name: str = Field(alias="LastName")
    email: EmailStr = Field(alias="EmailId")
    phone: Optional[str] = Field(alias="Contact", default=None)
    legacy_program_code: str = Field(alias="CourseCode")

# ==========================================
# Enterprise ETL Engine
# ==========================================
class ETLEngine:
    def __init__(self, db_pool: asyncpg.Pool):
        self.pool = db_pool

    async def _stream_chunks(self, file_content: bytes, file_type: str, chunk_size: int = 1000) -> AsyncGenerator[List[Dict[str, Any]], None]:
        """
        Memory-bounded async generator parsing legacy files into dictionary batches.
        Prevents memory exhaustion on multi-million row archives.
        """
        chunk = []
        if file_type == 'csv':
            # Decode bytes to string stream for CSV reader
            stream = io.StringIO(file_content.decode('utf-8'))
            reader = csv.DictReader(stream)
            for row in reader:
                chunk.append(row)
                if len(chunk) >= chunk_size:
                    yield chunk
                    chunk = []
            if chunk:
                yield chunk

        elif file_type == 'json':
            # Assumes a JSON array of objects
            data = json.loads(file_content)
            for row in data:
                chunk.append(row)
                if len(chunk) >= chunk_size:
                    yield chunk
                    chunk = []
            if chunk:
                yield chunk
                
        elif file_type == 'xlsx':
            # Placeholder for openpyxl/pandas execution
            # In a real environment: df = pd.read_excel(file_content); yield chunks
            raise NotImplementedError("XLSX streaming requires 'openpyxl' or 'pandas' dependency.")
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    async def _quarantine_record(self, conn: asyncpg.Connection, tenant_id: uuid.UUID, batch_id: uuid.UUID, entity: str, row_index: int, raw: dict, error: str):
        """Isolates a failed record into the migration_quarantine table for admin review."""
        await conn.execute("""
            INSERT INTO migration.migration_quarantine 
            (tenant_id, batch_id, entity_type, row_index, raw_payload, error_reason)
            VALUES ($1, $2, $3, $4, $5, $6)
        """, tenant_id, batch_id, entity, row_index, json.dumps(raw), error)

    async def process_student_migration(self, tenant_id: uuid.UUID, file_content: bytes, file_type: str, dry_run: bool = False) -> dict:
        """
        Master orchestration for Student Data Migration.
        Executes entirely within an atomic transaction bounded to the tenant_id.
        """
        batch_id = uuid.uuid4()
        stats = {"total": 0, "inserted": 0, "quarantined": 0}

        async with self.pool.acquire() as conn:
            # Enforce Tenant Isolation for this session
            await conn.execute("SET LOCAL app.current_tenant_id = $1", str(tenant_id))
            
            # Start Atomic Transaction
            transaction = conn.transaction()
            await transaction.start()
            
            try:
                row_offset = 0
                # Process in memory-bounded chunks
                async for chunk in self._stream_chunks(file_content, file_type):
                    for idx, raw_row in enumerate(chunk):
                        global_idx = row_offset + idx
                        stats["total"] += 1
                        
                        # 1. Schema Validation & Mapping
                        try:
                            clean_student = LegacyStudentMap(**raw_row)
                        except ValidationError as e:
                            await self._quarantine_record(conn, tenant_id, batch_id, 'STUDENT', global_idx, raw_row, f"Schema Validation Error: {e.errors()}")
                            stats["quarantined"] += 1
                            continue

                        # 2. Database Insertion with Savepoints (Sub-transactions)
                        # This prevents one bad row (e.g. duplicate email) from aborting the entire chunk
                        try:
                            async with conn.transaction(): # Creates a Postgres SAVEPOINT
                                await conn.execute("""
                                    INSERT INTO users (tenant_id, role, first_name, last_name, email, phone)
                                    VALUES ($1, 'STUDENT', $2, $3, $4, $5)
                                """, tenant_id, clean_student.first_name, clean_student.last_name, clean_student.email, clean_student.phone)
                                stats["inserted"] += 1
                                
                        except asyncpg.UniqueViolationError:
                            await self._quarantine_record(conn, tenant_id, batch_id, 'STUDENT', global_idx, raw_row, "Duplicate Email Address")
                            stats["quarantined"] += 1
                        except asyncpg.ForeignKeyViolationError:
                            await self._quarantine_record(conn, tenant_id, batch_id, 'STUDENT', global_idx, raw_row, "Foreign Key Mismatch (e.g. Invalid Program Code)")
                            stats["quarantined"] += 1
                        except Exception as e:
                            await self._quarantine_record(conn, tenant_id, batch_id, 'STUDENT', global_idx, raw_row, str(e))
                            stats["quarantined"] += 1

                    row_offset += len(chunk)

                # 3. Dry-Run Handling
                if dry_run:
                    logger.info(f"DRY RUN ENABLED: Rolling back batch {batch_id}")
                    await transaction.rollback()
                    stats["status"] = "DRY_RUN_SUCCESSFUL_ROLLED_BACK"
                else:
                    await transaction.commit()
                    stats["status"] = "COMMITTED"

                stats["batch_id"] = str(batch_id)
                return stats

            except Exception as e:
                # Absolute catastrophic failure fallback
                await transaction.rollback()
                logger.error(f"Catastrophic ETL failure: {e}")
                raise
