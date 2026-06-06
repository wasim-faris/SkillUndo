from django.core.mail import send_mail
from django.conf import settings

from django.core.mail import send_mail
from django.conf import settings


def send_notification_email(
    recipient_email,
    subject,
    message,
):
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=False,
    )
    
def send_session_request_email(user, sender_name):
    send_notification_email(
        recipient_email=user.email,
        subject="New SkillSwap Session Request",
        message=f"{sender_name} sent you a session request.",
    )
    
def send_session_accepted_email(user):
    send_notification_email(
        recipient_email=user.email,
        subject="Session request accepted",
        message="Your session request was accepted."
    )

def send_session_cancelled_email(user):
    send_notification_email(
        recipient_email=user.email,
        subject="SkillSwap Session Cancelled",
        message="Your scheduled SkillSwap session has been cancelled.",
    )