import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def send_email_via_brevo(recipient_email, subject, message):
    """
    Sends an email using the Brevo REST API, based on the generate_otp() implementation pattern.
    """
    try:
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "accept": "application/json",
                "api-key": settings.BREVO_API_KEY,
                "content-type": "application/json",
            },
            json={
                "sender": {
                    "name": "SkillUndo",
                    "email": "waseemfaris179@gmail.com",
                },
                "to": [
                    {
                        "email": recipient_email,
                    }
                ],
                "subject": subject,
                "textContent": message,
            },
            timeout=10,
        )

        # Log and print Brevo response status and content for debugging
        print("Brevo Status:", response.status_code)
        print("Brevo Response:", response.text)
        logger.info(f"Brevo Status: {response.status_code}")
        logger.info(f"Brevo Response: {response.text}")

        return response.status_code in [200, 201]

    except Exception as e:
        print("Brevo Email Error:", e)
        logger.error(f"Brevo Email Error: {e}", exc_info=True)
        return False


def send_notification_email(recipient_email, subject, message):
    """
    Alias/wrapper for send_email_via_brevo to ensure backward compatibility.
    """
    return send_email_via_brevo(recipient_email, subject, message)


def send_session_request_email(user, sender_name):
    return send_email_via_brevo(
        recipient_email=user.email,
        subject="New SkillSwap Session Request",
        message=f"{sender_name} sent you a session request.",
    )


def send_session_accepted_email(user):
    return send_email_via_brevo(
        recipient_email=user.email,
        subject="Session request accepted",
        message="Your session request was accepted.",
    )


def send_session_cancelled_email(user):
    return send_email_via_brevo(
        recipient_email=user.email,
        subject="SkillSwap Session Cancelled",
        message="Your scheduled SkillSwap session has been cancelled.",
    )


def send_session_rejected_email(user):
    return send_email_via_brevo(
        recipient_email=user.email,
        subject="Session request rejected",
        message="Your session request was rejected.",
    )
