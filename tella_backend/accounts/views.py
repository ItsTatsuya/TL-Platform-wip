import hashlib
import hmac
import time

from django.conf import settings
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import EmailTokenObtainPairSerializer, UserSerializer
from .constants import GroupName
from .models import User
from students.models import ExternalUserMapping


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": {"code": "REFRESH_TOKEN_REQUIRED", "message": "Refresh token is required.", "details": {}}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return Response(
                {"error": {"code": "INVALID_REFRESH_TOKEN", "message": "Refresh token is invalid or expired.", "details": {}}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MoodleExchangeView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        external_id = str(request.data.get("moodle_user_id") or "").strip()
        email = str(request.data.get("email") or "").strip().lower()
        signature = str(request.data.get("signature") or "")
        try:
            timestamp = int(request.data.get("timestamp"))
        except (TypeError, ValueError):
            timestamp = 0
        if not external_id or not email or not signature or abs(time.time() - timestamp) > 300:
            return Response({"error": {"code": "INVALID_SSO_REQUEST", "message": "Invalid or expired SSO request.", "details": {}}}, status=401)
        payload = f"{external_id}|{email}|{timestamp}"
        expected = hmac.new(settings.MOODLE_SSO_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not settings.MOODLE_SSO_SECRET or not hmac.compare_digest(expected, signature):
            return Response({"error": {"code": "INVALID_SSO_SIGNATURE", "message": "Invalid SSO signature.", "details": {}}}, status=401)
        mapping = ExternalUserMapping.objects.select_related("user").filter(
            provider=ExternalUserMapping.Provider.MOODLE, external_user_id=external_id,
        ).first()
        user = mapping.user if mapping else User.objects.filter(email=email).first()
        if user is None:
            user = User.objects.create_user(
                email=email, username=f"moodle-{external_id}",
                first_name=request.data.get("first_name", ""),
                last_name=request.data.get("last_name", ""),
            )
        ExternalUserMapping.objects.update_or_create(
            provider=ExternalUserMapping.Provider.MOODLE, external_user_id=external_id,
            defaults={"user": user, "metadata": {"email": email}},
        )
        student_group, _ = Group.objects.get_or_create(name=GroupName.STUDENT)
        user.groups.add(student_group)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": UserSerializer(user).data})
