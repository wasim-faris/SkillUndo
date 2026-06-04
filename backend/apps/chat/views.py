from core.responses import error_response, success_response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.users.models import User
from apps.chat.serializers import (
    SendMessageSerializer,
    MessageSerializer,
    ChatListSerializer,
)
from apps.chat.services import (
    send_message,
    mark_conversation_as_read,
    get_conversation,
    get_chat_list,
)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        print(request.data)
        serializer = SendMessageSerializer(data=request.data)

        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)

        receiver = get_object_or_404(User, id=serializer.validated_data["receiver_id"])
        message = send_message(
            request.user, receiver, serializer.validated_data["content"]
        )

        return success_response(
            data=MessageSerializer(message).data, message="Message send successfully"
        )


class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, receiver_id):

        receiver = get_object_or_404(User, id=receiver_id)
        print("Current User:", request.user.id)
        print("Receiver:", receiver.id)
        mark_conversation_as_read(sender=receiver, receiver=request.user)

        conversation = get_conversation(user=request.user, other_user=receiver)

        return success_response(
            data=MessageSerializer(conversation, many=True).data,
            message="Coversation fetched succesfully",
        )


class ChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        chats = get_chat_list(user=request.user)

        return success_response(
            data=ChatListSerializer(chats, many=True).data,
            message="Chats fetched successfully",
            status_code=200,
        )
