import uuid
import enum
from sqlalchemy import Column, String, DateTime, Numeric, Enum as SAEnum, text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class EntryType(str, enum.Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"
    REFUND = "REFUND"
    WAIVER = "WAIVER"

class FeeLedgerEntry(Base):
    """
    Append-Only Ledger for all financial transactions.
    Database-level triggers guarantee absolute immutability.
    """
    __tablename__ = "fee_ledger_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Financial data
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    entry_type = Column(SAEnum(EntryType), nullable=False)
    balance_after = Column(Numeric(12, 2), nullable=False)
    
    # Provider Integration (Idempotency mapping)
    reference_id = Column(String(255), nullable=False) 
    created_at = Column(DateTime(timezone=True), server_default=text('now()'), nullable=False)

    __table_args__ = (
        Index('idx_fee_ledger_tenant_student', 'tenant_id', 'student_id'),
        Index('idx_fee_ledger_reference', 'reference_id', unique=True),
    )
