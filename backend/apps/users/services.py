from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, PasswordResetToken
from django.utils import timezone
from datetime import timedelta
import secrets
from apps.users.models import OTPVerification
from config import settings
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils.crypto import get_random_string


def authenticate_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return None

    if idinfo.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        return None

    if not idinfo.get("email_verified"):
        return None

    email = idinfo.get("email")
    if not email:
        return None

    name = idinfo.get("name") or email.split("@")[0]
    user = User.objects.filter(email=email).first()

    if user:
        if user and not user.is_verified:
            user.is_verified = True
            user.save(update_fields=["is_verified"])
    else:
        password = get_random_string(20)
        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            is_verified=True,
        )
        Profile.objects.create(user=user)

    return get_tokens_for_user(user)


def register_user(validated_data):
    print("working correclty")
    """
    creates a new user and their profile.
    and return the created user

    """
    user = User.objects.create_user(
        email=validated_data["email"],
        password=validated_data["password"],
        name=validated_data["name"],
        city=validated_data.get("city", ""),
        language=validated_data.get("language", ""),
        is_verified=False,
    )

    Profile.objects.create(user=user)
    print("BEFORE OTP")
    generate_otp(user)
    print("AFTER OTP")
    return user


def login_user(email, password):
    """
    check email and password
    return JWt tockens if correct both
    then return None if wrong
    """
    user = authenticate(email=email, password=password)

    if not user:
        return None

    if not user.is_verified:
        return None

    return get_tokens_for_user(user)


def get_tokens_for_user(user):
    """
    Generate JWT access and refresh tokens for a user.
    """

    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


def get_user_profile(user):
    """
    return the user object with the profile
    """
    return User.objects.select_related("profile").get(id=user.id)


def updated_user_profile(user, validated_data):
    """
    Updates user fields
    return updated user.
    """
    for field, value in validated_data.items():
        setattr(user, field, value)
    user.save()

    return user


def logout_user(refresh_token):
    token = RefreshToken(refresh_token)
    token.blacklist()
    return True


def request_reset_token(email):

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return None

    PasswordResetToken.objects.filter(user=user).delete()
    reset_token = PasswordResetToken.objects.create(
        user=user, expires_at=timezone.now() + timedelta(hours=1)
    )

    reset_url = f"http://localhost:5173/reset-password-confirm/{reset_token.token}"
    print(reset_url)

    return None


def validate_reset_password(token_id, new_password):
    try:
        token = PasswordResetToken.objects.get(token=token_id)
    except PasswordResetToken.DoesNotExist:
        return None

    if token.expires_at < timezone.now():
        token.delete()
        return None

    # verify password
    print("NEW PASSWORD:", new_password)
    token.user.set_password(new_password)
    print("HASH AFTER SET:", token.user.password)
    token.user.save()
    print("PASSWORD SAVED")
    token.delete()
    return True


def generate_otp(user):
    print("comming here")
    """
    Creates 6 digit OTP and send to email
    Delete old OTP first
    """

    # delete old otp if exists
    OTPVerification.objects.filter(user=user).delete()

    code = str(secrets.randbelow(900000) + 100000)

    print(code)

    OTPVerification.objects.create(
        user=user, code=code, expires_at=timezone.now() + timedelta(minutes=10)
    )
    print("FROM EMAIL:", settings.DEFAULT_FROM_EMAIL)

    print("BEFORE SEND")

    requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        },
        json={
            "sender": {"name": "SkillUndo", "email": "waseemfaris179@gmail.com"},
            "to": [{"email": user.email}],
            "subject": "SkillSwap Verification Code",
            "textContent": f"Your OTP is {code}",
        },
    )

    print("AFTER EMAIL")
    return True


def verify_otp(user, code):
    """
    Checks OTP code.
    Return True if correct and not expired code.
    Return None if wrong or Expired
    """

    try:
        otp = OTPVerification.objects.get(user=user)
    except OTPVerification.DoesNotExist:
        return None

    if otp.expires_at < timezone.now():
        otp.delete()
        return None

    if otp.code != code:
        return None

    user.is_verified = True
    user.save()
    otp.delete()
    return True


def resend_otp(user):
    """
    Resends OTP to user email.
    """
    if user.is_verifed:
        return None
    return generate_otp(user)
