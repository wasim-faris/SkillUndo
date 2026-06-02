from .models import Message


def send_message(sender, receiver, content):
    return Message.objects.create(
        sender=sender,
        receiver=receiver,
        content=content
    )