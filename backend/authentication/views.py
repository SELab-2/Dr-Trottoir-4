from dj_rest_auth.jwt_auth import (
    set_jwt_access_cookie,
    set_jwt_refresh_cookie,
    set_jwt_cookies,
)
from dj_rest_auth.views import LoginView, PasswordChangeView
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from authentication.serializers import (
    CustomTokenRefreshSerializer,
    CustomTokenVerifySerializer,
    CustomSignUpSerializer,
    CustomLogoutSerializer,
)
from base.models import Lobby
from base.serializers import UserSerializer


class CustomSignUpView(APIView):
    @extend_schema(request={None: CustomSignUpSerializer}, responses={201: UserSerializer})
    def post(self, request):
        """
        Register a new user
        """
        # validate signup
        signup = CustomSignUpSerializer(data=request.data)
        signup.is_valid(raise_exception=True)
        # create new user
        user = signup.save(request)
        # delete the lobby entry with the user email
        lobby_instance = Lobby.objects.filter(email=user.email)
        lobby_instance.delete()
        # create the response
        response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return response


class CustomLoginView(LoginView):
    def get_response(self):
        data = {
            "message": _("successful login"),
            "user": UserSerializer(self.user).data,
        }
        response = Response(data, status=status.HTTP_200_OK)
        set_jwt_cookies(response, self.access_token, self.refresh_token)
        return response


class CustomLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomLogoutSerializer

    @extend_schema(request={}, responses={200: serializer_class, 401: serializer_class, 500: serializer_class})
    def post(self, request):
        response = self.serializer_class().logout_user(request)
        return response


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

    @extend_schema(responses={200: None, 401: None})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        # get new access and refresh token
        data = dict(serializer.validated_data)
        # construct the response
        response = Response({"message": _("refresh of tokens successful")}, status=status.HTTP_200_OK)
        set_jwt_access_cookie(response, data["access"])
        set_jwt_refresh_cookie(response, data["refresh"])
        return response


class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = CustomTokenVerifySerializer

    @extend_schema(responses={200: None, 401: None})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response({"message": _("refresh token validation successful")}, status=status.HTTP_200_OK)


class CustomPasswordChangeView(PasswordChangeView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: None, 400: None, 401: None})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": _("new password has been saved")}, status=status.HTTP_200_OK)
