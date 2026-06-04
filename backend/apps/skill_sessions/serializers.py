from rest_framework import serializers
from .models import SessionRequest, Review, CreditTransaction
from apps.users.serializers import UserSerializer
from apps.skills.serializers import SkillSerializer
from core.constants import MIN_RATING, MAX_RATING
from apps.skills.models import UserSkill
from apps.users.models import User
from django.utils import timezone
from .services import can_join_meeting

class SessionRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.UUIDField(write_only=True)
    teach_skill = SkillSerializer(read_only=True)
    teach_skill_id = serializers.UUIDField(write_only=True)
    learn_skill = SkillSerializer(read_only=True)
    learn_skill_id = serializers.UUIDField(write_only=True)
    reviewer_ids = serializers.SerializerMethodField()
    meeting_link = serializers.SerializerMethodField()
    can_join_meeting = serializers.SerializerMethodField()

    class Meta:
        model = SessionRequest
        fields = [
            "id",
            "sender",
            "receiver",
            "receiver_id",
            "status",
            "proposed_time",
            "message",
            "teach_skill",
            "teach_skill_id",
            "learn_skill",
            "learn_skill_id",
            "meeting_link",
            "meeting_link_added_at",
            "reviewer_ids",
            "created_at",
            "can_join_meeting",
        ]

        read_only_fields = ["id", "sender", "status", "created_at"]
        

    def get_reviewer_ids(self, obj):
        return [str(rid) for rid in obj.reviews.values_list("reviewer_id", flat=True)]
    
    def get_meeting_link(self, obj):
        if can_join_meeting(obj):
            return obj.meeting_link
        return None
    
    def get_can_join_meeting(self, obj):
        return can_join_meeting(obj)

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        # 1. cannot send request to yourself
        if str(attrs["receiver_id"]) == str(request.user.id):
            raise serializers.ValidationError(
                "you cannot send a session request to yourself"
            )
        # 2. checking receiver exists and active
        try:
            receiver = User.objects.get(
                id=attrs["receiver_id"], is_active=True, is_verified=True
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "This user does not exists or is not active"
            )
        # 3. check receiver is avaialble for swapping skills
        if not receiver.is_available:
            raise serializers.ValidationError(
                "This user is not Available for skill swap right now"
            )
        # 4. check sender actually teaches the teach_skill
        sender_teaches = UserSkill.objects.filter(
            user=user, skill_id=attrs["teach_skill_id"], skill_type="teach"
        ).exists()

        if not sender_teaches:
            raise serializers.ValidationError("You dont teach this skill")
        # 5. check receiver actually teaches the learn_skill
        receiver_teaches = UserSkill.objects.filter(
            user=receiver, skill_id=attrs["learn_skill_id"], skill_type="teach"
        ).exists()

        if not receiver_teaches:
            raise serializers.ValidationError(
                "This user does not teach the skill you want to learn"
            )

        pending_exists = SessionRequest.objects.filter(
            sender=user, receiver=receiver, status="pending"
        ).exists()

        if pending_exists:
            raise serializers.ValidationError(
                "You already have a pendings request with this user"
            )

        already_exists = SessionRequest.objects.filter(
            sender=request.user, receiver_id=attrs["receiver_id"], status="pending"
        ).exists()

        if already_exists:
            raise serializers.ValidationError(
                "You already have a pending request with this user"
            )

        # 7. check no active confirmed session exists between these two
        confirmed_exists = (
            SessionRequest.objects.filter(
                sender=user, receiver=receiver, status="confirmed"
            ).exists()
            or SessionRequest.objects.filter(
                sender=receiver, receiver=user, status="confirmed"
            ).exists()
        )

        if confirmed_exists:
            raise serializers.ValidationError(
                "You already have an action session with this user"
            )
        # 8. check proposed_time is in the future
        if attrs["proposed_time"] <= timezone.now():
            raise serializers.ValidationError("Proposed time must be in the future")
        
        # 9 teach skill and learn not be same
        if attrs["teach_skill_id"]==attrs["learn_skill_id"]:
            raise serializers.ValidationError(
                "Teaching and learning skills cannot be the same."
            )

        # store receiver object so service can use it
        attrs["receiver"] = receiver
        return attrs


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    reviewee_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "session",
            "reviewee",
            "reviewer",
            "reviewee_id",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "reviewer", "session", "created_at"]

    def validate_rating(self, value):
        if not MIN_RATING <= value <= MAX_RATING:
            raise serializers.ValidationError(
                f"Rating must be between {MIN_RATING} and {MAX_RATING}"
            )
        return value

    def validate(self, attrs):
        request = self.context["request"]
        session = self.context["session"]

        # check if already reviewed
        already_reviewed = Review.objects.filter(
            session=session, reviewer=request.user
        ).exists()

        if already_reviewed:
            raise serializers.ValidationError("You have already reviewed this session")
        valid_reviewees = [session.sender.id, session.receiver.id]

        if attrs["reviewee_id"] not in valid_reviewees:
            raise serializers.ValidationError("Invalid reviewee for this session")
        return attrs


class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditTransaction
        fields = [
            "id",
            "amount",
            "reason",
            "expires_at",
            "created_at",
        ]
        read_only_fields = fields
