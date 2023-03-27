from dj_rest_auth.jwt_auth import (
    unset_jwt_cookies,
    set_jwt_access_cookie,
    set_jwt_refresh_cookie, set_jwt_cookies,
)
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.views import LoginView, PasswordChangeView
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from authentication.serializers import CustomRegisterSerializer, CustomTokenRefreshSerializer, \
    CustomTokenVerifySerializer
from base.models import Lobby
from base.serializers import UserSerializer
from config import settings
from util.request_response_util import request_to_dict


class CustomSignupView(APIView):
    serializer_class = CustomRegisterSerializer

    @extend_schema(responses={200: None, 403: None})
    def post(self, request):
        """
        Register a new user
        """
        data = request_to_dict(request.data)

        required_keys = [
            "email",
            "verification_code",
            "password1",
            "password2",
            "phone_number",
            "first_name",
            "last_name"
        ]
        missing_keys = [k for k in required_keys if k not in data.keys()]
        if missing_keys:
            return Response(
                {k: ["This field is required."] for k in missing_keys},
                status=status.HTTP_400_BAD_REQUEST
            )
        # check if there is a lobby entry for this email address
        lobby_instances = Lobby.objects.filter(email=data.get('email'))
        if not lobby_instances:
            return Response(
                {
                    "message": f"{data.get('email')} has no entry in the lobby, you must contact an admin to gain access to the platform"},
                status=status.HTTP_403_FORBIDDEN
            )
        lobby_instance = lobby_instances[0]
        # check if the verification code is valid
        if lobby_instance.verification_code != data.get("verification_code"):
            return Response(
                {"message": "invalid verification code"},
                status=status.HTTP_403_FORBIDDEN
            )
        # add the role to the request, as this was already set by an admin
        if hasattr(request.data, "dict"):
            request.data._mutable = True
            request.data["role"] = lobby_instance.role_id
            request.data._mutable = False
        else:
            request.data["role"] = lobby_instance.role_id

        # create a user
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(request)
        # create an access and refresh token
        access_token, refresh_token = jwt_encode(user)

        # add the user data to the response
        response = Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        # set the cookie headers
        set_jwt_cookies(response, access_token, access_token)

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

    @extend_schema(responses={200: None, 401: None, 500: None})
    def post(self, request):
        response = Response(
            {"message": _("successfully logged out")},
            status=status.HTTP_200_OK,
        )

        cookie_name = getattr(settings, "JWT_AUTH_REFRESH_COOKIE", None)
        try:
            if cookie_name and cookie_name in request.COOKIES:
                token = RefreshToken(request.COOKIES.get(cookie_name))
                token.blacklist()
        except KeyError:
            response.data = {"message": _("refresh token was not included in request cookies")}
            response.status_code = status.HTTP_401_UNAUTHORIZED
        except (TokenError, AttributeError, TypeError) as error:
            if hasattr(error, "args"):
                if "Token is blacklisted" in error.args or "Token is invalid or expired" in error.args:
                    response.data = {"message": _(error.args[0].lower())}
                    response.status_code = status.HTTP_401_UNAUTHORIZED
                else:
                    response.data = {"message": _("an error has occurred.")}
                    response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            else:
                response.data = {"message": _("an error has occurred.")}
                response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        unset_jwt_cookies(response)

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
        response = Response(
            {"message": _("refresh of tokens successful")},
            status=status.HTTP_200_OK
        )
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

        return Response(
            {"message": "refresh token validation successful"},
            status=status.HTTP_200_OK
        )


class CustomPasswordChangeView(PasswordChangeView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: None, 400: None, 401: None})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": _("new password has been saved")},
            status=status.HTTP_200_OK
        )
