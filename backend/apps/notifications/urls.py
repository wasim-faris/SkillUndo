from django.urls import path
from .views import NotificationView,MarkNotificationAsReadView,NotificationUnreadCountView

urlpatterns = [
    path("", NotificationView.as_view(), name="notification-list"),
    path(
    "<uuid:notification_id>/read/",
    MarkNotificationAsReadView.as_view(),
    name="mark-notification-read",
),
    path(
    "unread-count/",
    NotificationUnreadCountView.as_view(),
    name="notification-unread-count",
)
]
