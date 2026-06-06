from django.shortcuts import render
from apps.reports.services import (
    create_report
)
from apps.reports.serializers import ReportUserSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.users.models import User
from django.shortcuts import get_object_or_404
from core.responses import success_response,error_response

class ReportUserView(APIView):
    print("view is working")
    permission_classes = [IsAuthenticated]
    
    def post(self, request, reported_user_id):
        
        reported_user = get_object_or_404(User, id=reported_user_id)
        
        serializer = ReportUserSerializer(data=request.data)
        
        if not serializer.is_valid():
            print(serializer.errors)
            return error_response(
                message=serializer.errors,
                status_code=400
            )
        
        report, error = create_report(
            reporter=request.user,
            reported_user=reported_user,
            reason= serializer.validated_data["reason"],
            description=serializer.validated_data["description"]
            )
        
        if error:
            return error_response(message=error)
        
        return success_response(
            message="Report submited successfully",
            data=ReportUserSerializer(report).data,
            status_code=201
        )
        