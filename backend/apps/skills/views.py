from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import SkillSerializer,UserSkillSerializer
from .services import (
    get_all_skills,
    add_skill_to_user,
    remove_skill_from_user,
    get_user_skills,
    get_matches_for_user
)
from core.responses import error_response,success_response
from apps.users.serializers import UserSerializer

class SkillListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        skills = get_all_skills()
        serializer = SkillSerializer(skills, many=True)
        return success_response(
            data=serializer.data,
            message="Skills fetched successfully"
        )
class UserSkillView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_skils = get_user_skills(request.user)
        serializer = UserSkillSerializer(user_skils, many=True, context={"request":request})
        
        return success_response(
            data=serializer.data,
            message="User skills Fetched succesfully"
        )
    
    def post(self, request):
        serializer = UserSkillSerializer(
            data=request.data,
            context={'request': request}
        )
        if not serializer.is_valid():
            return error_response(
                message=serializer.errors,
                status_code=400
            )
            
        user_skills = add_skill_to_user(
            user = request.user,
            skill_id=serializer.validated_data['skill_id'],
            skill_type=serializer.validated_data['skill_type']
        )
        
        return success_response(
            data=UserSkillSerializer(user_skills, context = {'request': request}).data,
            message="Skill added successfully",
            status_code=201
        )
    
class UserSkillDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, skill_id):
        remove_skill_from_user(request.user, skill_id)
        
        return success_response(
            message="Skill removed succesfully"
        )

class MatchFeedview(APIView):
    def get(self, request):
        matches = get_matches_for_user(request.user)
        serializer = UserSerializer(matches, many = True)
        
        return success_response(
            data=serializer.data,
            message="Matches Fetched successfully"
        )
        
          
        