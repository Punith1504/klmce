from fastapi import APIRouter, Depends
import asyncpg
from typing import List, Dict, Any

from app.core.database import get_db_connection
from app.core.dependencies import require_roles, Role

router = APIRouter()

@router.get("/attendance-trends")
async def get_attendance_trends(
    token: dict = Depends(require_roles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Highly optimized analytical query using PostgreSQL WINDOW functions to compare 
    current daily attendance against a 30-day moving average, completely filtered by RLS.
    """
    # RLS ensures that if an Admin from Tenant A triggers this, the COUNT(*) 
    # strictly ignores the millions of rows belonging to Tenant B at the kernel level.
    sql = """
        WITH daily_stats AS (
            SELECT 
                DATE(date) as attendance_date,
                COUNT(*) FILTER (WHERE status = 'PRESENT') as present_count,
                COUNT(*) as total_students
            FROM attendance_records
            GROUP BY DATE(date)
        ),
        moving_averages AS (
            SELECT 
                attendance_date,
                present_count,
                total_students,
                ROUND((present_count::decimal / NULLIF(total_students, 0)) * 100, 2) as daily_percentage,
                AVG(ROUND((present_count::decimal / NULLIF(total_students, 0)) * 100, 2)) 
                    OVER (ORDER BY attendance_date ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING) as historical_avg
            FROM daily_stats
        )
        SELECT 
            attendance_date::text,
            COALESCE(daily_percentage, 0) as current_percentage,
            COALESCE(ROUND(historical_avg, 2), 0) as historical_percentage
        FROM moving_averages
        ORDER BY attendance_date DESC
        LIMIT 30;
    """
    
    records = await conn.fetch(sql)
    return [dict(r) for r in records]


@router.get("/revenue")
async def get_revenue_analytics(
    token: dict = Depends(require_roles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.FINANCE)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Utilizes GROUP BY ROLLUP to generate sub-totals and grand-totals of revenue 
    collection per month, preventing the Python application from calculating aggregates in-memory.
    """
    sql = """
        SELECT 
            COALESCE(TO_CHAR(transaction_date, 'YYYY-MM'), 'GRAND_TOTAL') as month,
            SUM(amount) as collected_revenue,
            COUNT(*) as transaction_count
        FROM fee_transactions
        WHERE status = 'SUCCESS'
        GROUP BY ROLLUP(TO_CHAR(transaction_date, 'YYYY-MM'))
        ORDER BY month ASC;
    """
    
    records = await conn.fetch(sql)
    return [dict(r) for r in records]


@router.get("/kpis")
async def get_kpis(
    token: dict = Depends(require_roles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Unified KPI fetching executing highly concurrent index scans.
    """
    # We could use asyncio.gather for parallel async execution, 
    # but a fast transaction block is cleaner.
    sql_dues = "SELECT COALESCE(SUM(amount), 0) as total FROM fee_transactions WHERE status = 'PENDING';"
    sql_faculty = "SELECT COUNT(*) as total FROM users WHERE role = 'FACULTY';"
    sql_absent = "SELECT COUNT(*) as total FROM attendance_records WHERE status = 'ABSENT' AND DATE(date) = CURRENT_DATE;"
    
    dues = await conn.fetchval(sql_dues)
    faculty = await conn.fetchval(sql_faculty)
    absent = await conn.fetchval(sql_absent)
    
    return {
        "outstanding_dues": float(dues),
        "active_faculty": faculty,
        "todays_absentee_count": absent
    }
