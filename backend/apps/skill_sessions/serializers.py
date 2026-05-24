from tkinter.constants import RAISED

from django.http import request
from rest_framework import serializers
from .models import SessionRequest, Review, CreditTransaction
from apps.users.serializers import UserSerializer
from apps.skills.serializers import SkillSerializer
from core.constants import MIN_RATING, MAX_RATING

class SessionRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.UUIDField(write_only=True)
    teach_skill = SkillSerializer(read_only=True)
    teach_skill_id = serializers.UUIDField(write_only=True)
    learn_skill = SkillSerializer(read_only=True)
    learn_skill_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = SessionRequest
        fields = [
            'id',
            'sender',
            'receiver_id',
            'status',
            'proposed_time',
            'message',
            'teach_skill',
            'teach_skill_id',
            'learn_skill',
            'learn_skill_id',
            'created_at'
        ]

        read_only_fields = ['id', 'sender', 'status', 'created_at']

    def validate(self, attrs):
        request = self.context['request']
        if str(attrs['receiver_id']) == str(request.user.id):
            raise  serializers.ValidationError(
                "you cannot send a session request to yourself"
            )

        already_exists = SessionRequest.objects.filter(
            sender = request.user,
            receiver_id = attrs['receiver_id'],
            status = 'pending'
        ).exists()

        if already_exists:
            raise serializers.ValidationError(
                "You already have a pending request with this user"
            )
        return attrs

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    reviewee_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'session',
            'reviewer',
            'reviewee_id',
            'rating',
            'commet',
            'created_at',
        ]
        read_only_fields = ['id', 'reviewer' , 'session' , 'created_at']

    def validate_rating(self, value):
        if not MIN_RATING <= value <=MAX_RATING:
            raise serializers.ValidationError(
                f"Rating must be between {MIN_RATING} and {MAX_RATING}"
            )
        return  value

    def validate(self, attrs):
        request = self.context['request']
        session = self.context['session']

        #check if already reviewed
        already_reviewed = Review.objects.filter(
            session = session,
            reviewer = request.user
        ).exists()

        if already_reviewed:
            raise serializers.ValidationError(
                "You have already reviewed this session"
            )
        valid_reviewees = [session.sender.id, session.receiver.id]

        if attrs['reviewee_id'] not in valid_reviewees:
            raise serializers.ValidationError(
                "Invalid reviewee for this session"
            )
        return attrs

class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditTransaction
        fields = [
            'id',
            'amount',
            'reason',
            'expires_at',
            'created_at',
        ]
        read_only_fields = fields