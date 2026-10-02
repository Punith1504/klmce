import logging
import requests
from celery import shared_task

logger = logging.getLogger(__name__)

META_GRAPH_URL = "https://graph.facebook.com/v19.0"
PHONE_NUMBER_ID = "MOCK_PHONE_ID_123456"
ACCESS_TOKEN = "MOCK_WHATSAPP_ACCESS_TOKEN"

# =========================================================
# Outbound Notifications (Interactive Templates)
# =========================================================
@shared_task(bind=True, max_retries=3)
def send_whatsapp_interactive_template(self, to_phone: str, template_name: str, components: list = None):
    """
    Dispatches pre-approved, highly interactive WhatsApp templates.
    Examples: 
      - Daily Absenteeism alerts with a 1-tap "Request Leave" button.
      - Outstanding Fee notices with embedded Stripe/UPI payment buttons.
    """
    url = f"{META_GRAPH_URL}/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en"},
            "components": components or []
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        logger.info(f"Successfully dispatched '{template_name}' template to {to_phone}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send template to {to_phone}: {e}")
        raise self.retry(exc=e, countdown=30)

@shared_task
def send_whatsapp_text(to_phone: str, message: str):
    """Utility function to send a standard conversational text reply."""
    url = f"{META_GRAPH_URL}/{PHONE_NUMBER_ID}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": message}
    }
    requests.post(url, json=payload, headers={"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"})

# =========================================================
# Inbound Conversational Bot Logic
# =========================================================
@shared_task
def process_inbound_whatsapp_message(payload: dict):
    """
    The Conversational Quick-Query Bot.
    Triggered asynchronously by the Webhook Router.
    """
    try:
        value = payload['entry'][0]['changes'][0]['value']
        messages = value.get('messages', [])
        
        if not messages:
            return
            
        message = messages[0]
        from_phone = message.get('from') # The phone number of the Parent
        message_type = message.get('type')
        
        if message_type == 'text':
            text_body = message.get('text', {}).get('body', '').strip().upper()
            
            # 1. Database Lookup (Simulated)
            # Query: SELECT student_name FROM users WHERE phone_number = from_phone AND role = 'PARENT'
            student_name = "Jane Doe"
            
            # 2. Conversational Routing
            if text_body == "ATTENDANCE":
                reply = f"📊 *Live Attendance for {student_name}:*\n- Present: 42 Days\n- Absent: 3 Days\n- Overall: 93.3%\n\n_Your child is currently inside the campus._"
                send_whatsapp_text.delay(from_phone, reply)
                
            elif text_body == "FEES":
                # Dynamically generate a secure 1-click payment link bound to their tenant
                payment_link = "https://erp.klmce.edu/pay/1a2b3c4d"
                reply = f"💰 *Fee Status for {student_name}:*\n- Due Amount: $1,250.00\n- Due Date: 15-Nov-2026\n\nTap here to pay instantly via Stripe/UPI: {payment_link}"
                send_whatsapp_text.delay(from_phone, reply)
                
            elif text_body == "EXAMS":
                reply = f"🎓 *Latest Results for {student_name}:*\n- Advanced Data Structures: A (94%)\n- Cloud Computing: B+ (88%)"
                send_whatsapp_text.delay(from_phone, reply)
                
            else:
                reply = "🤖 *Welcome to the KLMCE Parent Bot!*\n\nReply with one of the following commands for instant updates:\n*ATTENDANCE*\n*FEES*\n*EXAMS*"
                send_whatsapp_text.delay(from_phone, reply)
                
        elif message_type == 'interactive':
            # Handle parent clicking a "Request Leave" button from an absenteeism alert
            button_reply = message.get('interactive', {}).get('button_reply', {}).get('id')
            if button_reply == 'action_request_leave':
                send_whatsapp_text.delay(from_phone, "✅ Leave request submitted to the Head of Department for review.")

    except Exception as e:
        logger.error(f"Critical error processing inbound WhatsApp message: {e}")
