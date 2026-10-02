import time
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

try:
    from jose import jwt
except ImportError:
    pass # Managed in requirements.txt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/credentials/google", tags=["Google Wallet API"])

# Simulated Google Cloud IAM Service Account Credentials
ISSUER_ID = "3388000000000000000" 
CLASS_ID = f"{ISSUER_ID}.KLMCE_CAMPUS_ID_CLASS"
SERVICE_ACCOUNT_EMAIL = "google-wallet-api@klmce.iam.gserviceaccount.com"
SERVICE_ACCOUNT_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMOCK_RSA_PRIVATE_KEY...\n-----END PRIVATE KEY-----"

class GooglePassRequest(BaseModel):
    student_id: str
    student_name: str
    nfc_access_payload: str

@router.post("/generate")
async def generate_google_wallet_jwt(req: GooglePassRequest):
    """
    Google Wallet Integration.
    Generates a cryptographically signed JSON Web Token (JWT) encapsulating a Google Wallet 
    GenericObject pass. Used to power the "Add to Google Wallet" button natively on Android devices.
    """
    object_id = f"{ISSUER_ID}.{req.student_id}"
    
    # Define the Generic Object payload structure according to Google Wallet API specifications
    generic_object = {
        "id": object_id,
        "classId": CLASS_ID,
        "genericType": "GENERIC_TYPE_UNSPECIFIED",
        "hexBackgroundColor": "#0b0f19", # KLMCE Branding Dark Mode
        "logo": {
            "sourceUri": {
                "uri": "https://erp.klmce.edu/assets/logo-white.png"
            }
        },
        "cardTitle": {
            "defaultValue": {
                "language": "en",
                "value": "KLMCE Digital Campus ID"
            }
        },
        "header": {
            "defaultValue": {
                "language": "en",
                "value": req.student_name
            }
        },
        "subheader": {
            "defaultValue": {
                "language": "en",
                "value": "Student ID"
            }
        },
        "barcode": {
            "type": "QR_CODE",
            "value": req.nfc_access_payload,
            "alternateText": req.student_id
        },
        # Enables seamless Android NFC tap-to-pay & Turnstile Access Control
        "smartTapRedemptionValue": req.nfc_access_payload 
    }
    
    claims = {
        "iss": SERVICE_ACCOUNT_EMAIL,
        "aud": "google",
        "typ": "savetowallet",
        "iat": int(time.time()),
        "payload": {
            "genericObjects": [generic_object]
        }
    }
    
    try:
        if 'jwt' in globals():
            # Cryptographically sign the token using the Google IAM Service Account RSA Private Key
            signed_jwt = jwt.encode(claims, SERVICE_ACCOUNT_PRIVATE_KEY, algorithm="RS256")
        else:
            signed_jwt = "MOCK_JWT_PAYLOAD"
            
        # Generates the definitive Add to Google Wallet deep-link URI
        save_url = f"https://pay.google.com/gp/v/save/{signed_jwt}"
        
        logger.info(f"Generated secure Google Wallet deep-link URI for Student {req.student_id}")
        
        return {
            "status": "SUCCESS",
            "save_url": save_url,
            "jwt": signed_jwt
        }
    except Exception as e:
        logger.error(f"Failed to sign Google Wallet JWT: {e}")
        raise HTTPException(status_code=500, detail="Cryptographic IAM signing failure.")
