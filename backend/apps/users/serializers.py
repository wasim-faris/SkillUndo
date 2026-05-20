from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "email",
            "name",
            "password",
            "confirm_password",
            "city",
            "language",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Password doesnt match !"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        # frontend come with dict then **using this one assign in to the variable to save in the db
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    # used serializer for the taking data not adding to the db
    email = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "avg_rating",
            "total_sessions",
            "credits",
            "is_verified",
        ]

        # used to only show in the frontend they cant edit this one
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    # this is used to take the data with the user objects instead of calling the profile alone using user serializer can get both and show it
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "name", "city", "language", "photo", "bio", "profile"]
        read_only_fields = ["id", "email"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "city", "language", "photo", "bio"]


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True, required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    new_confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_confirm_password"]:
            raise serializers.ValidationError({"password": "Password do not match !"})
        return attrs


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
