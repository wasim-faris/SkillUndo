from rest_framework import serializers
from .models import Skill,UserSkill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']
        read_only_fields = ['id']
        
class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only = True)
    skill_id = serializers.UUIDField(write_only = True)
    
    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_id', 'skill_type']
        read_only_fields = ['id']
        
    def validate(self, attrs):
        user = self.context['request'].user
        skill_id = attrs.get('skill_id')
        skill_type = attrs.get('skill_type')
        
        if UserSkill.objects.filter(
            user=user,
            skill_id = skill_id,
            skill_type = skill_type
        ).exists():
            raise serializers.ValidationError(
                "You already added this skill"
            )
            
        return attrs