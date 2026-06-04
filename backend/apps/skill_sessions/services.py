from django.utils import timezone
from datetime import timedelta
from .models import SessionRequest, Review
from apps.skills.models import Skill
from apps.users.models import Profile
from core.constants import (
    SESSION_PENDING,
    SESSION_CONFIRMED,
    SESSION_CANCELLED,
    SESSION_COMPLETED,
    CREDIT_PER_SESSION,
    CREDIT_EXPIRY_DAYS,
)
from .models import CreditTransaction
from django.db.models import F
from django.db.models import Avg


#helper func for the session link sharing

def can_join_meeting(session):
    return (
        session.status == SESSION_CONFIRMED and timezone.now() >=session.proposed_time - timedelta(minutes=10)
    )

def send_session_request(sender, validated_data):
    """
    Creates a new session request.
    Return created SessionRequest.
    """
    session = SessionRequest.objects.create(
        sender=sender,
        receiver=validated_data["receiver"],
        teach_skill=Skill.objects.get(id=validated_data["teach_skill_id"]),
        learn_skill=Skill.objects.get(id=validated_data["learn_skill_id"]),
        proposed_time=validated_data["proposed_time"],
        message=validated_data.get("message", ""),
        status=SESSION_PENDING,
    )

    return session


def accept_session_request(session, user):
    """
    Accepts a session request
    Only receiver can accept.
    Return Updated session or None
    """
    print("ACCEPT FUNCTION CALLED")

    if session.receiver != user:
        return None, "Only receiver can accept the session"

    if session.status != SESSION_PENDING:
        return None, "Session is not pending"

    session.status = SESSION_CONFIRMED
    
    session.meeting_link = (
        f"https://meet.jit.si/skillswap-{session.id}"
    )
    
    print("LINK:", session.meeting_link)
    
    session.meeting_link_added_at = timezone.now()
    
    session.save()
    return session, None


def decline_session_request(session, user):
    """
    Declines a session request.
    Only receiver can decline.
    Return updated session or None
    """

    if session.receiver != user:
        return None, "Only receiver can decline"

    if session.status != SESSION_PENDING:
        return None, "Session is not pending"

    session.status = SESSION_CANCELLED
    session.save()
    return session, None


def cancel_session(session, user):
    """
     Cancels a session.
    Both sender and receiver can cancel.
    Returns updated session or None.
    """

    if user not in [session.sender, session.receiver]:
        return None, "You are not part of this session"

    if session.status == SESSION_CANCELLED:
        return None, "Cannot cancel this session"

    session.status = SESSION_CANCELLED
    session.save()
    return session,None


def add_meeting_link(session, user, link):
    """
    Only confirmed session participants can add meeting link.
    """
    if user not in [session.sender, session.receiver]:
        return None, "You are not part of this session"

    if session.status != SESSION_CONFIRMED:
        return None, "Session must be confirmed before adding meeting link"

    session.meeting_link = link
    session.meeting_link_added_at = timezone.now()
    session.save()

    return session, None


def complete_session(session, user):
    """
    Real world rules:
    1. Must be after proposed_time
    2. Must have meeting link
    3. Both must mark complete separately
    4. Credits awarded only after both users review
    """

    if user not in [session.sender, session.receiver]:
        return None, "You are not part of this session"

    if session.status != SESSION_CONFIRMED:
        return None, "Session is not confirmed"
    
    if timezone.now() < session.proposed_time:
        return None, "You cannot complete a session before it start"

    if not session.meeting_link:
        return None, "Meeting link is required before completing session"
    
    if session.session_started_at:
        print(
        "CAN COMPLETE AFTER:",
        session.session_started_at + timedelta(minutes=30)
    )
    if not session.session_started_at:
        return None, "You must join the meeting before completing the session"
    
    if timezone.now() < (
        session.session_started_at + timedelta(minutes=30)
    ):
        return None, "Session must run for at least 30 minutes before completion"

    if user == session.sender:
        if session.completed_by_sender:
            return None, "You already marked this session complete"
        session.completed_by_sender = True
    elif user == session.receiver:
        if session.completed_by_receiver:
            return None, "You already marked this session complete"
        session.completed_by_receiver = True

    session.save()

    if session.completed_by_sender and session.completed_by_receiver:
        session.status = SESSION_COMPLETED
        session.save()
        update_session_count(session.sender)
        update_session_count(session.receiver)

    return session, None


def award_credit(user):
    """
    Awards credit to a user.
    Creates credit transaction record.
    Credit expires after CREDIT_EXPIRY_DAYS.
    """
    profile = Profile.objects.get(user=user)
    profile.credits += CREDIT_PER_SESSION
    profile.save()

    CreditTransaction.objects.create(
        user=user,
        amount=CREDIT_PER_SESSION,
        reason="Session complete",
        expires_at=timezone.now() + timedelta(days=CREDIT_EXPIRY_DAYS),
    )


def update_session_count(user):
    """
    Increments total_sessions count on profile.
    """
    Profile.objects.filter(user=user).update(total_sessions=F("total_sessions") + 1)


def submit_review(session, reviewer, validated_data):
    """
    Submits a review after session complete.
    Updates reviewee average rating automatically.
    Returns created Review or None.
    """

    if session.status != SESSION_COMPLETED:
        return None, "session is not completed yet"

    if reviewer not in [session.sender, session.receiver]:
        return None, "You are not part of this session"

    already_reviewed = Review.objects.filter(
        session=session, reviewer=reviewer
    ).exists()

    if already_reviewed:
        return None, "You already reviewed this session"

    review = Review.objects.create(
        session=session,
        reviewer=reviewer,
        reviewee_id=validated_data["reviewee_id"],
        rating=validated_data["rating"],
        comment=validated_data.get("comment", ""),
    )

    update_avg_rating(review.reviewee)
    # award credits only if BOTH users reviewed
    review_count = Review.objects.filter(session=session).count()
    if review_count == 2:
        award_credit(session.sender)
        award_credit(session.receiver)
    return review, None


def update_avg_rating(user):
    """
    Recalculates and saves average rating for a user.
    """
    avg = Review.objects.filter(reviewee=user).aggregate(average_rating=Avg("rating"))[
        "average_rating"
    ]  # to get the value instead of the key

    Profile.objects.filter(user=user).update(
        avg_rating=round(avg, 2) if avg else 0.00  # if avg then update else put 0.00
    )


def get_my_session(user, status=None):
    """
    Returns all sessions for a user.
    Optionally filter by status.
    """
    queryset = SessionRequest.objects.filter(
        sender=user
    ) | SessionRequest.objects.filter(receiver=user)

    if status:
        queryset = queryset.filter(status=status)

    return queryset.select_related(
        "sender",
        "sender__profile",
        "receiver",
        "receiver__profile",
        "teach_skill",
        "learn_skill",
    ).order_by("-created_at")


def get_session_by_id(session_id, user):
    """
    Returns a single session.
    User must be sender or receiver.
    Returns None if not found or not authorized.
    """
    try:
        session = SessionRequest.objects.select_related(
            "sender", "receiver", "learn_skill", "teach_skill"
        ).get(id=session_id)

    except SessionRequest.DoesNotExist:
        return None

    if user not in [session.sender, session.receiver]:
        return None

    return session

def session_join_time(session):
    session.session_started_at = timezone.now()
    session.save()
    