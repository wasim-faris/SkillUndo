from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    LogoutSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
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
)
from core.responses import success_response, error_response
from core.permissions import IsOwner
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator


class RegisterView(APIView):

    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="3/m", block=True), name="dispatch")
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


class LoginView(APIView):

    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="5/m", block=True), name="dispatch")
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
