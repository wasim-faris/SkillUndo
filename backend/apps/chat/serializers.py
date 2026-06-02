from rest_framework import serializers
from .models import Message


class SendMessageSerializer(serializers.Serializer):
    receiver_id = serializers.UUIDField(required=True)
    content = serializers.CharField(max_length=1000)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"


class ChatListSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    user_name = serializers.CharField()
    last_message = serializers.CharField()
    last_message_at = serializers.DateTimeField()
