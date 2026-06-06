from rest_framework.views import APIView
from apps.admin_panel.services import get_dashboard_stats
from core.responses import success_response

class DashbboardStatsView(APIView):
    def get(self, request):
        data = get_dashboard_stats()
        return success_response(
            data=data,
            message="Dashboard stats fetched successfully",
        )
        
