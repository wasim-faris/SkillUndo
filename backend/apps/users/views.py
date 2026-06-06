from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.skills.serializers import UserSkillSerializer
from apps.skills.services import get_user_skills
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    LogoutSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    OTPVerifySerializer,
    ResendOTPSerializer,
)
from rest_framework.views import APIView
from .services import (
    register_user,
    login_user,
    get_user_profile,
    updated_user_profile,
    logout_user,
    request_reset_token,
    validate_reset_password,
    verify_otp,
    resend_otp,
    get_tokens_for_user,
)
from core.responses import success_response, error_response
from core.permissions import IsOwner
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from apps.users.models import User


@method_decorator(ratelimit(key="ip", rate="3/m", block=True), name="dispatch")
class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)
        user = register_user(serializer.validated_data)

        return success_response(
            data=UserSerializer(user).data,
            message="Account created successfully",
            status_code=201,
        )


@method_decorator(ratelimit(key="ip", rate="5/m", block=True), name="dispatch")
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)

        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)
        try:
            user = User.objects.get(email=serializer.validated_data["email"])
        except User.DoesNotExist:
            return error_response(message="Invalid credentials", status_code=404)
        success = verify_otp(user=user, code=serializer.validated_data["code"])

        if not success:
            return error_response(message="Invalid or expired OTP", status_code=400)

        tokens = get_tokens_for_user(user)

        return success_response(data=tokens, message="Email verified successfully")


@method_decorator(ratelimit(key="ip", rate="3/m", block=True), name="dispatch")
class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)

        try:
            user = User.objects.get(email=serializer.validated_data["email"])
        except User.DoesNotExist:
            return error_response(message="Invalid credentials", status_code=404)
        if user.is_verified:
            return error_response(message="Account already Verified", status_code=400)

        resend_otp(user)
        return success_response(message="OTP send successfully")


@method_decorator(ratelimit(key="ip", rate="5/m", block=True), name="dispatch")
class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)

        tokens = login_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if not tokens:
            return error_response(message="Invalid email or password", status_code=401)
        return success_response(data=tokens, message="Login succesful")


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_user_profile(request.user)
        return success_response(
            data=UserSerializer(user).data, message="Profile fetched succesfully"
        )


class ProfileUpdateview(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def patch(self, request):
        serializer = UserUpdateSerializer(
            instance=request.user, data=request.data, partial=True
        )

        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)
        user = updated_user_profile(request.user, serializer.validated_data)

        return success_response(
            data=UserSerializer(user).data, message="Profile updated succesfully"
        )


class LogoutView(APIView):
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)

        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)
        logout_user(serializer.validated_data["refresh"])

        return success_response(message="logout succesfully")


class PasswordResetRequestView(APIView):

    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="3/m", block=True), name="dispatch")
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)

        request_reset_token(serializer.validated_data["email"])

        return success_response(
            message="If this email exists a reset link has been sent",
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="3/m", block=True), name="dispatch")
    def post(self, request, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)

        token = validate_reset_password(
            token,
            new_password=serializer.validated_data["new_password"],
        )
        if not token:
            return error_response(message=serializer.errors, status_code=400)
        return success_response(message="Password changed succesfully", status_code=200)


class PublicProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = (
                User.objects.select_related(
                    "profile",
                )
                .prefetch_related("user_skills")
                .get(id=user_id)
            )
            print(user.email)
            print(user.user_skills.all())
        except User.DoesNotExist:
            return error_response(message="User not found", status_code=404)
        return success_response(
            data=UserSerializer(user).data, message="Profile Fetched successfully"
        )


class PublicUserSkillView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return error_response(message="User not found", status_code=404)
        skills = get_user_skills(user)
        serializer = UserSkillSerializer(
            skills, many=True, context={"request": request}
        )

        return success_response(
            data=serializer.data, message="User Skill fetched successfully"
        )

        
        