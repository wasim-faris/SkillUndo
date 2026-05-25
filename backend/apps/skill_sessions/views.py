from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import SessionRequest
from .serializers import (
    SessionRequestSerializer,
    ReviewSerializer,
    CreditTransactionSerializer,
)
from .services import (
    send_session_request,
    accept_session_request,
    decline_session_request,
    cancel_session,
    complete_session,
    submit_review,
    get_my_session,
    get_session_by_id,
)
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
        result = accept_session_request(session, request.user)

        if not result:
            return error_response(
                message="You cannot accept this session", status_code=400
            )
        return success_response(
            data=SessionRequestSerializer(result).data,
            message="Session accepted successfully",
        )


class DeclineSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result = decline_session_request(session, request.user)
        if not result:
            return error_response(
                message="You cannot decline this session", status_code=400
            )
        return success_response(
            data=SessionRequestSerializer(result).data,
            message="Session declined successfully",
        )


class CancelSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result = cancel_session(session, request.user)

        if not result:
            return error_response(
                message="You cannot cancel this session", status_code=400
            )
        return success_response(message="Session cancelled successfully")


class CompleteSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        session = get_object_or_404(SessionRequest, id=session_id)
        result = complete_session(session, request.user)

        if not result:
            return error_response(
                message="You cannot complete this session", status_code=400
            )
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
        review = submit_review(
            session=session,
            reviewer=request.user,
            validated_data=serializer.validated_data,
        )

        if not review:
            return error_response(
                message="You cannot review this session", status_code=400
            )

        return success_response(
            data=ReviewSerializer(review).data,
            message="Review submitted succesfully",
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
