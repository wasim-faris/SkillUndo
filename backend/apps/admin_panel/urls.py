from django.urls import path
from .views import (
    DashboardStatsView,
    RecentReportsView,
    RecentSessionsView,
    RecentUsersView,
)

urlpatterns = [
    
    path("dashboard/", DashboardStatsView.as_view()),
    path("reports/", RecentReportsView.as_view()),
    path("sessions/", RecentSessionsView.as_view()),
    path("users/", RecentUsersView.as_view()),
]

