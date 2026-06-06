from django.urls import path
from .views import DashbboardStatsView

urlpatterns = [
    path("", DashbboardStatsView.as_view(), name="admin-panel"),
]
