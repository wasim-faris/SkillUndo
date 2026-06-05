from django.db import models
from core.base_model import BaseModel
from apps.users.models import User
# Create your models here.

class Notification(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    notification_type = models.CharField(max_length=50)