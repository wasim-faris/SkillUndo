from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User,Profile

def register_user(validated_data):
    """
    creates a new user and their profile.
    and return the created user
    
    """
    user = User.objects.create_user(
        email = validated_data['email'],
        password = validated_data['password'],
        name = validated_data['name'],
        city = validated_data.get('city', ''),
        language = validated_data.get('language', '')
    )
    
    Profile.objects.create(user=user)
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
     
    #this is call th get tockens user func to make the refresh and access token
    tokens = get_tockens_for_user(user)
    
    return tokens

def get_tockens_for_user(user):
    """
    Generate JWT access and refresh tokens for a user.
    """
    
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }
    
def get_user_profile(user):
    """
    return the user object with the profile
    """
    return User.objects.select_related('profile').get(id=user.id)

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