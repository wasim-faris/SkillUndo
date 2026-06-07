from rest_framework import serializers
from .models import UserReport

class ReportUserSerializer(serializers.ModelSerializer):
    reporter = serializers.CharField(source="reporter.name")
    reported_user = serializers.CharField(source="reported_user.name")
    class Meta:
        model = UserReport
        fields = [
            "reporter",
            "reported_user",
            "reason",
            "description",
        ]
        
    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                 "Description is required"
            )
        return value
        
        
