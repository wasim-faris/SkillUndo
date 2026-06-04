from django.urls import path
from .views import SendMessageView, ConversationView, ChatListView

urlpatterns = [
    path("send/", SendMessageView.as_view(), name="send-message"),
    path(
        "conversation/<uuid:receiver_id>/",
        ConversationView.as_view(),
        name="conversation",
    ),
    path("", ChatListView.as_view(), name="chat-list"),
]
