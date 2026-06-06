from apps.skill_sessions.models import SessionRequest
from apps.reports.models import UserReport
from apps.users.models import User


def get_dashboard_stats():
    return {
        "total_users": User.objects.count(),
        "total_sessions": SessionRequest.objects.count(),
        "completed_sessions": SessionRequest.objects.filter(status="completed").count(),
        "cancelled_sessions": SessionRequest.objects.filter(status="cancelled").count(),
        "pending_reports": UserReport.objects.filter(status="pending").count(),
    }
    
def get_reports():
    return UserReport.objects.all()

def get_sessions():
    return SessionRequest.objects.all()

def get_users():
    return User.objects.all()