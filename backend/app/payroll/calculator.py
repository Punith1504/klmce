import logging
from typing import Dict
from decimal import Decimal, ROUND_HALF_UP
from fastapi import APIRouter, Depends
import asyncpg

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/payroll", tags=["Payroll Calculation Engine"])

# Statutory Compliance Rates (India / US Configurable)
PF_RATE = Decimal('0.12')           # Provident Fund / 401k match (12% of Base)
HRA_RATE = Decimal('0.40')          # House Rent Allowance (40% of Base)
TRANSPORT_ALLOWANCE = Decimal('1600.00') # Fixed monthly TA
PROFESSIONAL_TAX = Decimal('200.00')     # Fixed state tax
TDS_RATE = Decimal('0.10')          # Simplified 10% flat Income Tax Deducted at Source

# Mock DB Dependency
async def get_db_pool(): pass

@router.post("/calculate-batch")
async def compute_faculty_salary_batch(faculty_id: str, working_days: int, present_days: int, paid_leaves: int, db_pool: asyncpg.Pool = Depends(get_db_pool)) -> Dict:
    """
    Attendance-to-Payroll Aggregator.
    Ingests biometric attendance (Present Days) and HR approved (Paid Leaves).
    Executes a pro-rata 'Loss of Pay' computation mathematically to output compliant tax line items.
    """
    # 1. Fetch Faculty Contract (Simulated)
    # query = "SELECT annual_base_pay FROM payroll.faculty_compensation WHERE faculty_id = $1"
    annual_base_pay = Decimal('1200000.00') # Fixed configuration
    monthly_base = annual_base_pay / Decimal('12')
    
    # 2. Compute Billable Metrics (Loss of Pay Logic)
    unpaid_leaves = working_days - (present_days + paid_leaves)
    if unpaid_leaves < 0: unpaid_leaves = 0
    billable_days = present_days + paid_leaves
    
    proration_factor = Decimal(billable_days) / Decimal(working_days)
    
    # 3. Calculate Earnings (Pro-rated)
    earned_base = (monthly_base * proration_factor).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    earned_hra = (earned_base * HRA_RATE).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    earned_ta = (TRANSPORT_ALLOWANCE * proration_factor).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    gross_earnings = earned_base + earned_hra + earned_ta
    
    # 4. Calculate Tax & Compliance Deductions
    provident_fund = (earned_base * PF_RATE).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    professional_tax = PROFESSIONAL_TAX
    tds_tax = (gross_earnings * TDS_RATE).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    total_deductions = provident_fund + professional_tax + tds_tax
    net_payable = gross_earnings - total_deductions
    
    return {
        "attendance": {
            "working_days": working_days,
            "present_days": present_days,
            "paid_leaves": paid_leaves,
            "unpaid_leaves": unpaid_leaves,
            "billable_days": billable_days
        },
        "earnings": {
            "base_pay": float(earned_base),
            "hra": float(earned_hra),
            "transport_allowance": float(earned_ta),
            "gross_earnings": float(gross_earnings)
        },
        "deductions": {
            "provident_fund": float(provident_fund),
            "professional_tax": float(professional_tax),
            "tds": float(tds_tax),
            "total_deductions": float(total_deductions)
        },
        "net_payable": float(net_payable)
    }
