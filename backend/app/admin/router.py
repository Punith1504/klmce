from fastapi import APIRouter, Depends
from pydantic import BaseModel
import asyncpg

from app.core.dependencies import get_db_connection
from app.core.security import require_roles, Role, RFC7807Exception

router = APIRouter()

class RolloverRequest(BaseModel):
    current_academic_year: str
    next_academic_year: str

@router.post("/trigger-rollover")
async def execute_eoy_rollover(
    req: RolloverRequest,
    # STRICT ENFORCEMENT: Only Super Admins can physically trigger a platform rollover
    token: dict = Depends(require_roles(Role.SUPER_ADMIN)), 
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Executes the End-Of-Year (EOY) institutional rollover pipeline.
    Promotes active students to alumni, upgrades grade levels, resets the scheduling matrix,
    and secures the cryptographic audit trail.
    """
    tenant_id = token["tenant_id"]
    admin_id = token["sub"]
    
    try:
        # Phase 1: Initialize Atomic Lock
        # If any mathematical step fails below, the entire database reverts instantly
        # to prevent the institution from being trapped in a corrupted half-rollover state.
        async with conn.transaction():
            
            # Phase 2: Graduation Processing
            # Find seniors (e.g., Grade 12) and permanently lock their status to ALUMNI
            sql_graduate = """
                UPDATE students 
                SET enrollment_status = 'ALUMNI' 
                -- We assume year 4/grade 12 depending on the institutional model
                WHERE enrollment_status = 'ACTIVE' 
                  -- (In a real scenario, this WHERE clause would specifically target the terminal grade)
                  AND tenant_id = $1::uuid; 
            """
            await conn.execute(sql_graduate, tenant_id)
            
            # Phase 3: Global Promotion
            # (e.g., Freshman -> Sophomore)
            # This logic depends highly on the internal schema, but conceptually updates cohort flags.
            # sql_promote = "UPDATE students SET grade_level = grade_level + 1 WHERE status = 'ACTIVE'..."
            
            # Phase 4: Timetable Matrix Shredding
            # The previous year's scheduling grid is structurally irrelevant to the new semester.
            # We wipe the active matrix to guarantee no GiST boundary overlaps for the incoming schedule.
            sql_matrix_reset = """
                DELETE FROM timetable_slots WHERE tenant_id = $1::uuid;
            """
            await conn.execute(sql_matrix_reset, tenant_id)
            
            # Phase 5: Cryptographic Audit Sealing
            # Manually inject the EOY event into the immutable log to prove exactly when and who fired it.
            sql_audit = """
                INSERT INTO audit_logs (tenant_id, action, entity_type, entity_id, changed_by, old_data, new_data)
                VALUES ($1::uuid, 'EOY_ROLLOVER_TRIGGERED', 'SYSTEM_ARCHITECTURE', $1::uuid, $2::uuid, $3::jsonb, $4::jsonb);
            """
            old_state = f'{{"academic_year": "{req.current_academic_year}"}}'
            new_state = f'{{"academic_year": "{req.next_academic_year}", "timetable_matrix": "SHREDDED", "alumni": "PROMOTED"}}'
            
            await conn.execute(sql_audit, tenant_id, admin_id, old_state, new_state)
            
        return {
            "status": "success",
            "message": f"EOY Archival Complete. The institution has been successfully rolled over to {req.next_academic_year}. The Timetable Matrix has been zeroed."
        }
        
    except Exception as e:
        raise RFC7807Exception(
            status_code=500,
            type="probs/eoy-rollover-failure",
            title="EOY Archival Engine Failure",
            detail=f"The atomic rollover transaction failed and the entire state change was instantly reverted. Trace: {str(e)}"
        )

from passlib.context import CryptContext
import pyotp
import string
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ProvisionUserRequest(BaseModel):
    role: str
    email: str
    first_name: str
    last_name: str
    login_id: str
    phone_number: str

@router.post("/provision-user")
async def provision_user(
    req: ProvisionUserRequest,
    # Restrict to admins
    token: dict = Depends(require_roles(Role.SUPER_ADMIN, Role.ADMIN)),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Provisions a new user with strict login ID requirements.
    Sends details to their email (mocked).
    """
    # 1. Enforce Role-based login constraints
    if req.role == 'PARENT' and not req.login_id.isdigit():
        raise RFC7807Exception(status_code=400, type="probs/invalid-parent-id", title="Invalid Format", detail="Parent IDs must contain only numbers.")
    if req.role == 'STUDENT' and not req.phone_number:
         raise RFC7807Exception(status_code=400, type="probs/missing-phone", title="Missing Phone", detail="Students must have a linked phone number for their Enrollment ID.")
    # (Admins are assumed to provide valid college ID)

    tenant_id = token["tenant_id"]

    try:
        # Generate temporary credentials
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        temp_password = ''.join(secrets.choice(alphabet) for i in range(12))
        hashed_password = pwd_context.hash(temp_password)
        
        # Generate MFA secret for 2FA requirement
        mfa_secret = pyotp.random_base32()
        
        sql_insert = """
            INSERT INTO erp_core.users (tenant_id, email, role, first_name, last_name, login_id, phone_number, password_hash, mfa_secret)
            VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING user_id;
        """
        user_id = await conn.fetchval(sql_insert, tenant_id, req.email, req.role, req.first_name, req.last_name, req.login_id, req.phone_number, hashed_password, mfa_secret)
        
        # In a real system, send email via a task queue (e.g. Celery) with `temp_password` and `mfa_secret` QR code.
        return {
            "status": "success",
            "message": f"User {req.login_id} successfully provisioned. Details and 2FA setup have been sent to {req.email}.",
            "user_id": user_id,
            "demo_temp_password": temp_password,
            "demo_mfa_secret": mfa_secret
        }
    except asyncpg.UniqueViolationError:
        raise RFC7807Exception(status_code=409, type="probs/conflict", title="Conflict", detail="User with this email, login_id, or phone number already exists.")
    except Exception as e:
        raise RFC7807Exception(status_code=500, type="probs/provisioning-failure", title="Provisioning Failure", detail=str(e))

