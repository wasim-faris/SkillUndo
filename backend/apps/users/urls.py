from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    ProfileUpdateview,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    VerifyOTPView,
    ResendOTPView,
    PublicProfileView,
    PublicUserSkillView
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", ProfileView.as_view(), name="profile"),
    path("me/update/", ProfileUpdateview.as_view(), name="profile-update"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path(
        "reset-password-confirm/<uuid:token>/",
        PasswordResetConfirmView.as_view(),
        name="rest-password-confirm",
    ),
    path("verify-otp/", VerifyOTPView.as_view(), name="otp-verify"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),

    path("profile/<uuid:user_id>/", PublicProfileView.as_view(), name="public-profile"),
    path("user/<uuid:user_id>/", PublicUserSkillView.as_view()),

]
