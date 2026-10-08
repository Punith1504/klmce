import io
import qrcode
from datetime import datetime, timezone
import jwt
from fastapi import APIRouter, HTTPException, Depends

# ReportLab for programmatic PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

router = APIRouter(prefix="/api/v1/academics", tags=["Transcripts & Credentials"])

# In production, this must be an asymmetric RSA key or high-entropy HS256 secret loaded from KMS
SECRET_VERIFICATION_KEY = "klmce-academic-trust-engine-super-secret-signature"

def generate_cryptographic_qr(student_id: str, cgpa: float, grad_year: int) -> io.BytesIO:
    """
    Generates a secure JSON Web Token (JWT) containing non-PII academic achievements,
    cryptographically signs it, and encodes it into a highly dense QR code.
    """
    payload = {
        "sub": "academic_credential",
        "student_id": student_id,  # Internal UUID, not exposing SSN or Names
        "cgpa": cgpa,
        "grad_year": grad_year,
        "iss": "KLMCE_ERP_TRUST_ENGINE",
        "exp": datetime.now(timezone.utc).timestamp() + (10 * 365 * 24 * 3600) # Valid for 10 years
    }
    
    # Sign the token
    token = jwt.encode(payload, SECRET_VERIFICATION_KEY, algorithm="HS256")
    
    # Construct the public verification URL
    verification_url = f"https://api.klmce.edu/api/v1/academics/verify-credential?token={token}"
    
    # Generate QR Code image
    qr = qrcode.QRCode(version=3, box_size=4, border=4, error_correction=qrcode.constants.ERROR_CORRECT_H)
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

async def generate_official_transcript_pdf(student_id: str, student_name: str, cgpa: float, grad_year: int) -> bytes:
    """
    Constructs the official PDF transcript dynamically using ReportLab, 
    embedding the cryptographic QR verification code directly into the footer.
    """
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    
    # ----- Header -----
    c.setFont("Helvetica-Bold", 22)
    c.drawString(150, 750, "KLMCE Official Academic Transcript")
    
    # ----- Body: Academic Information -----
    c.setFont("Helvetica", 12)
    c.drawString(50, 680, f"Name: {student_name}")
    c.drawString(50, 660, f"Student ID Reference: ***{student_id[-6:]}") # PII masking
    c.drawString(50, 640, f"Graduation Year: {grad_year}")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 600, f"Final Cumulative GPA (CGPA): {cgpa}")
    
    # (In a full system, you would iterate over course grades here)
    
    # ----- Footer: Cryptographic Verification QR -----
    c.setLineWidth(1)
    c.line(50, 180, 550, 180)
    
    qr_bytes = generate_cryptographic_qr(student_id, cgpa, grad_year)
    qr_image = ImageReader(qr_bytes)
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 150, "Cryptographic Authenticity Verification:")
    
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(50, 135, "This document contains a tamper-proof cryptographic signature.")
    c.drawString(50, 120, "Scan the QR code to verify this degree directly against the KLMCE Trust Database.")
    
    # Draw QR code in the bottom corner
    c.drawImage(qr_image, 450, 30, width=100, height=100)
    
    c.save()
    pdf_buffer.seek(0)
    return pdf_buffer.read()

@router.get("/verify-credential")
async def verify_transcript_credential(token: str):
    """
    Public Endpoint. Employers or Admissions Officers scanning the printed QR code 
    are routed here. It decrypts the JWT and verifies authenticity without leaking PII.
    """
    try:
        # Cryptographically verify the signature
        payload = jwt.decode(token, SECRET_VERIFICATION_KEY, algorithms=["HS256"])
        
        # Ensure it's the correct token type
        if payload.get("sub") != "academic_credential":
            raise ValueError("Invalid token subject")
            
        # (In a production environment, we could execute a secondary live DB query here 
        # to ensure the degree hasn't been revoked post-graduation.)

        return {
            "status": "VERIFIED_AUTHENTIC",
            "message": "This credential has been mathematically proven and verified by the KLMCE Trust Engine.",
            "data": {
                "credential_type": "Official Academic Transcript / Degree",
                "issuer": payload.get("iss"),
                "cgpa": payload.get("cgpa"),
                "graduation_year": payload.get("grad_year"),
                "student_identifier": f"***{payload.get('student_id')[-6:]}" # Masked to protect PII
            }
        }
    except Exception as e:
        # If the token is modified by even 1 byte, this will trigger
        raise HTTPException(
            status_code=400, 
            detail="CRITICAL: INVALID OR FORGED CREDENTIAL. The cryptographic signature failed verification."
        )
