from django.contrib import admin
from .models import UserReport


@admin.register(UserReport)
class UserReportAdmin(admin.ModelAdmin):
    list_display = (
        "reporter",
        "reported_user",
        "reason",
        "status",
        "created_at",
    )

    search_fields = (
        "reporter__username",
        "reported_user__username",
        "reason",
    )

    list_filter = (
        "status",
        "reason",
    )