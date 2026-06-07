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
from apps.admin_panel.pagination import AdminPagination


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
        paginator = AdminPagination()

        paginated_reports = paginator.paginate_queryset(reports, request)

        serializer = ReportUserSerializer(paginated_reports, many=True)

        return success_response(
            data={
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": serializer.data,
            },
            message="Report fetched successfully",
        )


class RecentSessionsView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        sessions = get_sessions()

        paginator = AdminPagination()

        paginated_sessions = paginator.paginate_queryset(sessions, request)

        serializer = SessionRequestSerializer(paginated_sessions, many=True)

        return success_response(
            data={
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": serializer.data,
            },
            message="Sessions fetched successfully",
        )


class RecentUsersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        users = get_users()

        paginator = AdminPagination()

        paginated_users = paginator.paginate_queryset(users, request)

        serializer = UserSerializer(paginated_users, many=True)

        return success_response(
            data={
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": serializer.data,
            },
            message="Users fetched successfully",
        )
