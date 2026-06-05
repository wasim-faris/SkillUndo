from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from core.responses import success_response
from django.shortcuts import get_object_or_404
from apps.notifications.services import (
    mark_notification_as_read,
    get_unread_notification_count,
)


class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
        ).order_by("-created_at")

        serializer = NotificationSerializer(notifications, many=True)

        return success_response(
            data=serializer.data, message="Notifications fetched successfully"
        )


class MarkNotificationAsReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):

        notification = get_object_or_404(
            Notification, id=notification_id, user=request.user
        )

        mark_notification_as_read(notification=notification)

        return success_response(message="Notifications marked as read")


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        count = get_unread_notification_count(user=request.user)

        return success_response(
            data={"count": count},
            message="Unread notification count fetched successfully",
        )
