
from core.responses import error_response,success_response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.users.models import User
from apps.chat.serializers import (
    SendMessageSerializer,
    MessageSerializer
)
from apps.chat.services import send_message

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        
        print(request.data)
        serializer = SendMessageSerializer(data=request.data)
    
        if not serializer.is_valid():
            return error_response(
                message=serializer.errors,
                status_code=400
            )
        
        receiver = get_object_or_404(User, id=serializer.validated_data['receiver_id'])
        message = send_message(request.user, receiver, serializer.validated_data['content'])
        
        return success_response(
            data=MessageSerializer(message).data,
            message = "Message send successfully"
        )