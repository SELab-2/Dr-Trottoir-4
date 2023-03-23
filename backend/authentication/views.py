from dj_rest_auth.jwt_auth import (
    unset_jwt_cookies,
    CookieTokenRefreshSerializer,
    set_jwt_access_cookie,
    set_jwt_refresh_cookie,
)
from dj_rest_auth.views import LogoutView, LoginView
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema

from config import settings


class LogoutViewWithBlacklisting(LogoutView):
    permission_classes = [IsAuthenticated]
    serializer_class = CookieTokenRefreshSerializer

    @extend_schema(responses={200: None, 401: None, 500: None})
    def logout(self, request):
        response = Response(
            {"detail": _("Successfully logged out.")},
            status=status.HTTP_200_OK,
        )

        cookie_name = getattr(settings, "JWT_AUTH_REFRESH_COOKIE", None)

        unset_jwt_cookies(response)

        try:
            if cookie_name and cookie_name in request.COOKIES:
                token = RefreshToken(request.COOKIES.get(cookie_name))
                token.blacklist()
        except KeyError:
            response.data = {"detail": _("Refresh token was not included in request cookies.")}
            response.status_code = status.HTTP_401_UNAUTHORIZED
        except (TokenError, AttributeError, TypeError) as error:
            if hasattr(error, "args"):
                if "Token is blacklisted" in error.args or "Token is invalid or expired" in error.args:
                    response.data = {"detail": _(error.args[0])}
                    response.status_code = status.HTTP_401_UNAUTHORIZED
                else:
                    response.data = {"detail": _("An error has occurred.")}
                    response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            else:
                response.data = {"detail": _("An error has occurred.")}
                response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
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


class LoginViewWithHiddenTokens(LoginView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and "access_token" in response.data:
            response.data["access_token"] = _("set successfully")
        if response.status_code == 200 and "refresh_token" in response.data:
            response.data["refresh_token"] = _("set successfully")

        return super().finalize_response(request, response, *args, **kwargs)
