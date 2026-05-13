from django.urls import path
from .views import (
    SkillListView,
    UserSkillDeleteView,
    UserSkillView,
    MatchFeedview
)

urlpatterns = [
    path("skills/", SkillListView.as_view(), name='skill-list'),
    path('me/skills/', UserSkillView.as_view(), name='user-skill-list'),
    path('me/skills/<uuid:skill_id>/', UserSkillDeleteView.as_view(), name='user-skill-delete'),
    path('me/matches/', MatchFeedview.as_view(), name='match-feed')
]