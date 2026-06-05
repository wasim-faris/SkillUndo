from .models import Notification


def create_notifications(user, title, message, notification_type):
    return Notification.objects.create(
        user=user, title=title, message=message, notification_type=notification_type
    )


def mark_notification_as_read(notification):
    if not notification.is_read:
        notification.is_read = True
        notification.save()


def get_unread_notification_count(user):
    return Notification.objects.filter(user=user, is_read=False).count()
