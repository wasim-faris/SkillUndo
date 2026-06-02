from rest_framework import serializers
from .models import Message


class SendMessageSerializer(serializers.Serializer):
    receiver_id = serializers.UUIDField()
    content = serializers.CharField(max_length=1000, trim_whitespace=True)
    
    
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"