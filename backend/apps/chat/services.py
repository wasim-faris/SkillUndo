from .models import Message
from django.db.models import Q


def send_message(sender, receiver, content):
    return Message.objects.create(sender=sender, receiver=receiver, content=content)


def get_conversation(user, other_user):
    message = Message.objects.filter(
        Q(sender=user, receiver=other_user) | Q(sender=other_user, receiver=user)
    )

    return message


def mark_conversation_as_read(sender, receiver):
    Message.objects.filter(sender=sender, receiver=receiver, is_read=False).update(
        is_read=True
    )


def get_chat_list(user):
    messages = (
        Message.objects.filter(Q(sender=user) | Q(receiver=user))
        .select_related("sender", "receiver")
        .order_by("-created_at")
    )

    chat_list = []
    seen_users = set()

    for message in messages:
        if message.sender == user:
            other_user = message.receiver
        else:
            other_user = message.sender

        if other_user.id in seen_users:
            continue

        seen_users.add(other_user.id)

        chat_list.append(
            {
                "user_id": other_user.id,
                "user_name": other_user.email,
                "last_message": message.content,
                "last_message_at": message.created_at,
            }
        )

        print(chat_list)

    return chat_list
