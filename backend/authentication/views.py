from dj_rest_auth.jwt_auth import (
    unset_jwt_cookies,
    CookieTokenRefreshSerializer,
    set_jwt_access_cookie,
    set_jwt_refresh_cookie, set_jwt_cookies,
)
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.views import LoginView
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from authentication.serializers import CustomRegisterSerializer
from base.models import Lobby
from base.serializers import UserSerializer
from config import settings
from util.request_response_util import request_to_dict


class CustomRegisterView(APIView):
    serializer_class = CustomRegisterSerializer

    @extend_schema(responses={200: None, 403: None})
    def post(self, request):
        """
        Register a new user
        """
        data = request_to_dict(request.data)

        # check if there is a lobby entry for this email address
        lobby_instances = Lobby.objects.filter(email=data.get('email'))
        if not lobby_instances:
            return Response(
                {
                    "message": f"The given email address {data.get('email')} has no entry in the lobby. You must contact an admin to gain access to the platform."},
                status=status.HTTP_403_FORBIDDEN
            )
        lobby_instance = lobby_instances[0]
        # check if the verification code is valid
        if lobby_instance.verification_code != data.get('verification_code'):
            return Response(
                {"message": "Invalid verification code"},
                status=status.HTTP_403_FORBIDDEN
            )

        # add the role to the request, as this was already set by an admin
        request.data._mutable = True
        request.data['role'] = lobby_instance.role_id
        request.data._mutable = False

        # create a user
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(request)
        # create an access and refresh token
        access_token, refresh_token = jwt_encode(user)

        # add the user data to the response
        response = Response({"res": str(user)}, status=status.HTTP_200_OK)
        # set the cookie headers
        set_jwt_cookies(response, access_token, access_token)

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


class CustomLoginView(LoginView):
    def get_response(self):
        data = {
            "message": "successful login",
            "user": UserSerializer(self.user).data,
        }
        response = Response(data, status=status.HTTP_200_OK)
        set_jwt_cookies(response, self.access_token, self.refresh_token)
        return response


class RefreshViewHiddenTokens(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and "access" in response.data:
            set_jwt_access_cookie(response, response.data["access"])
            response.data["access-token-refresh"] = _("success")
            # we don't want this info to be in the body for security reasons (HTTPOnly!)
            del response.data["access"]
        if response.status_code == 200 and "refresh" in response.data:
            set_jwt_refresh_cookie(response, response.data["refresh"])
            response.data["refresh-token-rotation"] = _("success")
            # we don't want this info to be in the body for security reasons (HTTPOnly!)
            del response.data["refresh"]
        return super().finalize_response(request, response, *args, **kwargs)
