from rest_framework.views import APIView
from apps.admin_panel.services import (
    get_dashboard_stats,
    get_reports,
    get_sessions,
    get_users,
)
from apps.reports.serializers import ReportUserSerializer
from core.responses import success_response
from rest_framework.permissions import IsAdminUser
from apps.skill_sessions.serializers import SessionRequestSerializer
from apps.users.serializers import UserSerializer

class DashboardStatsView(APIView):
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        data = get_dashboard_stats()
        return success_response(
            data=data,
            message="Dashboard stats fetched successfully",
        )

class RecentReportsView(APIView):
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        reports = get_reports()
        
        return success_response(
            data=ReportUserSerializer(reports, many=True).data,
            message="Report fetched successfully"
        )
        
class RecentSessionsView(APIView):
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        sessions = get_sessions()
        
        return success_response(
            data=SessionRequestSerializer(sessions, many=True).data,
            message="Sessions fetched successfully"
        )

class RecentUsersView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        users = get_users()
        
        return success_response(
            data=UserSerializer(users, many=True).data,
            message="Users fetched successfully"
        )