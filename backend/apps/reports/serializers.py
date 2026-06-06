from rest_framework import serializers
from .models import UserReport

class ReportUserSerializer(serializers.ModelSerializer):
    print("serializer is working")
    class Meta:
        model = UserReport
        fields = [
            "reason",
            "description",
        ]
        
    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                 "Description is required"
            )
        return value
        
        
