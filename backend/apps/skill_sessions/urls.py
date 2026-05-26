from django.urls import path
from .views import (
    SendSessionRequestView,
    MysessionsView,
    SessionDetailView,
    AcceptSessionView,
    DeclineSessionView,
    CancelSessionView,
    CompleteSessionView,
    SubmitReviewView,
    CreditHistoryView,
    PublicProfileView,
    PublicUserSkillView
)

urlpatterns = [
    path("request/", SendSessionRequestView.as_view(), name="send-session-request"),
    path("my/", MysessionsView.as_view(), name="my-sessions"),
    path("<uuid:session_id>/", SessionDetailView.as_view(), name="session-detail"),
    path(
        "<uuid:session_id>/accept/", AcceptSessionView.as_view(), name="accept-session"
    ),
    path(
        "<uuid:session_id>/decline/",
        DeclineSessionView.as_view(),
        name="decline-session",
    ),
    path(
        "<uuid:session_id>/cancel/", CancelSessionView.as_view(), name="cancel-session"
    ),
    path(
        "<uuid:session_id>/complete/",
        CompleteSessionView.as_view(),
        name="complete-session",
    ),
    path("<uuid:session_id>/review/", SubmitReviewView.as_view(), name="submit-review"),
    path("credits/", CreditHistoryView.as_view(), name="credit-history"),
    path("profile/<uuid:user_id>/", PublicProfileView.as_view(), name="public-profile"),
    path("user/<uuid:user_id>/", PublicUserSkillView.as_view()),
]
