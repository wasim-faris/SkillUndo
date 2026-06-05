from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.users.models import User
from .models import SessionRequest
from .serializers import (
    SessionRequestSerializer,
    ReviewSerializer,
    CreditTransactionSerializer,
)

from apps.users.serializers import UserSerializer
from apps.skills.serializers import UserSkillSerializer
from .services import (
    send_session_request,
    accept_session_request,
    decline_session_request,
    cancel_session,
    complete_session,
    submit_review,
    get_my_session,
    get_session_by_id,
    add_meeting_link,
    record_join_time,
)
from apps.skills.services import get_user_skills
from core.responses import error_response, success_response


class SendSessionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SessionRequestSerializer(
            data=request.data, context={"request": request}
        )

        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)
        session = send_session_request(
            sender=request.user, validated_data=serializer.validated_data
        )

        return success_response(
            data=SessionRequestSerializer(session).data,
            message="Session request send successfully",
        )


class MysessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status = request.query_params.get("status", None)
        sessions = get_my_session(request.user, status=status)
        serializer = SessionRequestSerializer(sessions, many=True)
        return success_response(
            data=serializer.data, message="Session fetched successfully"
        )


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_session_by_id(session_id, request.user)
        if not session:
            return error_response(message="Session not found", status_code=404)
        return success_response(
            data=SessionRequestSerializer(session).data,
            message="Session fetched successfully",
        )


class AcceptSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result, error = accept_session_request(session, request.user)

        print(result)

        if not result:
            return error_response(message=error, status_code=400)
        return success_response(
            data=SessionRequestSerializer(result).data,
            message="Session accepted successfully",
        )


class DeclineSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result, error = decline_session_request(session, request.user)
        if not result:
            return error_response(message=error, status_code=400)
        return success_response(
            data=SessionRequestSerializer(result).data,
            message="Session declined successfully",
        )


class CancelSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result, error = cancel_session(session, request.user)

        if not result:
            return error_response(message=error, status_code=400)
        return success_response(message="Session cancelled successfully")


class CompleteSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result, error = complete_session(session, request.user)

        if not result:
            return error_response(message=error, status_code=400)
        return success_response(
            data=SessionRequestSerializer(result).data,
            message="Session comeleted successfully",
        )


class SubmitReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        serializer = ReviewSerializer(
            data=request.data, context={"request": request, "session": session}
        )
        if not serializer.is_valid():
            return error_response(message=serializer.errors, status_code=400)
        review, error = submit_review(
            session=session,
            reviewer=request.user,
            validated_data=serializer.validated_data,
        )

        if not review:
            return error_response(message=error, status_code=400)

        return success_response(
            data=ReviewSerializer(review).data,
            message="Review submitted successfully",
            status_code=201,
        )


class CreditHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transaction = request.user.credit_transactions.all()
        serializer = CreditTransactionSerializer(transaction, many=True)
        return success_response(
            data=serializer.data, message="Credit history fected succesfully"
        )


class PublicProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = (
                User.objects.select_related(
                    "profile",
                )
                .prefetch_related("user_skills")
                .get(id=user_id)
            )
            print(user.email)
            print(user.user_skills.all())
        except User.DoesNotExist:
            return error_response(message="User not found", status_code=404)
        return success_response(
            data=UserSerializer(user).data, message="Profile Fetched successfully"
        )


class PublicUserSkillView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return error_response(message="User not found", status_code=404)
        skills = get_user_skills(user)
        serializer = UserSkillSerializer(
            skills, many=True, context={"request": request}
        )

        return success_response(
            data=serializer.data, message="User Skill fetched successfully"
        )


class AddMeetingLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        link = request.data.get("meeting_link", "")

        if not link:
            return error_response(message="Meeting link is required", status_code=400)
        result, error = add_meeting_link(session, request.user, link)

        if not result:
            return error_response(message=error, status_code=400)
        return success_response(
            data=SessionRequestSerializer(result).data,
            message="Meeting link added successfully",
        )


class JoinSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)

        record_join_time(session=session)

        print(session.session_started_at)

        return success_response(message="Session joined")
