from .models import UserReport

def create_report(reporter,reported_user,reason,description):
    
    print("fucn is wokrinbg")
    
    if reporter == reported_user:
        return None, "You cannot report yourself"
    
    if UserReport.objects.filter(
        reporter=reporter,reported_user=reported_user
    ).exists():
        return None, "You have already reported this user"
    
    
    report = UserReport.objects.create(
        reporter = reporter,
        reported_user = reported_user,
        reason = reason,
        description = description
    )
    
    print(report.reporter, report.reported_user)
    
    return report, None