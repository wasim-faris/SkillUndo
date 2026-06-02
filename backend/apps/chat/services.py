from .models import Message
from django.db.models import Q

def send_message(sender, receiver, content):
    return Message.objects.create(
        sender=sender,
        receiver=receiver,
        content=content
    )
    
def get_conversation(user, other_user):
    message = Message.objects.filter(
        Q(sender=user, receiver=other_user )| Q(sender=other_user, receiver=user)
    ).order_by("created_at")

  
def mark_conversation_as_read(sender, receiver):
    Message.objects.filter(
        sender=sender,
        receiver=receiver,
        is_read=False
    ).update(is_read = True)
    