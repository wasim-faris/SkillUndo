from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    ProfileUpdateview
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", ProfileView.as_view(), name='profile'),
    path("me/update/", ProfileUpdateview.as_view(), name='profile-update')
]