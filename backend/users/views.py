from dj_rest_auth.views import LogoutView
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _

from base.models import User
from config import settings
from users.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class CustomLogoutView(LogoutView):
    def logout(self, request):
        response = Response(
            {"detail": _("Successfully logged out.")},
            status=status.HTTP_200_OK,
        )

        from dj_rest_auth.jwt_auth import unset_jwt_cookies
        from rest_framework_simplejwt.tokens import RefreshToken

        cookie_name = getattr(settings, "JWT_AUTH_REFRESH_COOKIE", None)

        unset_jwt_cookies(response)

        if cookie_name and cookie_name in request.COOKIES:
            token = RefreshToken(request.COOKIES.get(cookie_name))
            token.blacklist()

        return response
