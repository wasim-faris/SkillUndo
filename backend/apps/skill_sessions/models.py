# apps/sessions/models.py
from django.db import models
from core.base_model import BaseModel
from core.constants import (
    SESSION_PENDING,
    SESSION_CONFIRMED,
    SESSION_COMPLETED,
    SESSION_CANCELLED,
)
from apps.users.models import User


class SessionStatus(models.TextChoices):
    PENDING = SESSION_PENDING, "Pending"
    CONFIRMED = SESSION_CONFIRMED, "Confirmed"
    COMPLETED = SESSION_COMPLETED, "Completed"
    CANCELLED = SESSION_CANCELLED, "Cancelled"


class SessionRequest(BaseModel):
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_sessions", db_index=True
    )
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_sessions", db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=SessionStatus.choices,
        default=SessionStatus.PENDING,
        db_index=True,
    )
    proposed_time = models.DateTimeField()
    message = models.TextField(blank=True)
    teach_skill = models.ForeignKey(
        "skills.Skill",
        on_delete=models.SET_NULL,
        null=True,
        related_name="taught_sessions",
    )
    learn_skill = models.ForeignKey(
        "skills.Skill",
        on_delete=models.SET_NULL,
        null=True,
        related_name="learned_sessions",
    )

    class Meta:
        db_table = "session_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender.email} → {self.receiver.email} ({self.status})"


class Review(BaseModel):
    session = models.ForeignKey(
        SessionRequest, on_delete=models.CASCADE, related_name="reviews"
    )
    reviewer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="given_reviews"
    )
    reviewee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_reviews"
    )
    rating = models.IntegerField()
    comment = models.TextField(blank=True)

    class Meta:
        db_table = "reviews"
        unique_together = ["session", "reviewer"]

    def __str__(self):
        return f"{self.reviewer.email} → {self.reviewee.email} ({self.rating}★)"


class CreditTransaction(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="credit_transactions",
        db_index=True,
    )
    amount = models.IntegerField()
    reason = models.CharField(max_length=100)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "credit_transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.amount} credits ({self.reason})"
