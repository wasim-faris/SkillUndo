from django.urls import path

from .views import ReportUserView

urlpatterns = [
    path(
    "<uuid:reported_user_id>/report/",
    ReportUserView.as_view(),
    name="report-user",
)
]