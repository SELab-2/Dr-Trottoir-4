from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _

from base.models import User
from config import settings
from util.request_response_util import request_to_dict


class CustomRegisterSerializer(RegisterSerializer):

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def create(self, validated_data):
        return super().create(validated_data)

    def custom_signup(self, request, user: User):
        data = request_to_dict(request.data)
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.phone_number = data.get('phone_number')
        user.role_id = data.get('role')
        region = data.get('region')
        if region:
            # TODO: change this to the same util function as used in user view
            user.region = data.get('region')
        user.save()


class CustomTokenRefreshSerializer(Serializer):
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def create(self, validated_data):
        return super().create(validated_data)

    def validate(self, incoming_data):
        # extract the request
        request = self.context['request']
        # get the cookie name of the refresh token
        cookie_name = settings.REST_AUTH["JWT_AUTH_REFRESH_COOKIE"]
        if not cookie_name or cookie_name not in request.COOKIES:
            from rest_framework_simplejwt.exceptions import InvalidToken
            raise InvalidToken(_("no valid refresh token found"))

        # get the refresh token
        refresh = RefreshToken(request.COOKIES.get(cookie_name))
        # rotate the token if needed
        if settings.SIMPLE_JWT["ROTATE_REFRESH_TOKENS"]:
            if settings.SIMPLE_JWT["BLACKLIST_AFTER_ROTATION"]:
                try:
                    # attempt to blacklist the given refresh token
                    refresh.blacklist()
                except AttributeError:
                    # if blacklist app not installed, `blacklist` method will
                    # not be present
                    pass

            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()

        return {"access": str(refresh.access_token), "refresh": str(refresh)}


class CustomTokenVerifySerializer(Serializer):
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def create(self, validated_data):
        return super().create(validated_data)

    def validate(self, incoming_data):
        # extract the request
        request = self.context['request']
        # get the cookie name of the refresh token
        cookie_name = settings.REST_AUTH["JWT_AUTH_REFRESH_COOKIE"]
        if not cookie_name or cookie_name not in request.COOKIES:
            from rest_framework_simplejwt.exceptions import InvalidToken
            raise InvalidToken(_("no valid refresh token found"))

        # get the refresh token
        refresh = RefreshToken(request.COOKIES.get(cookie_name))

        if settings.SIMPLE_JWT["BLACKLIST_AFTER_ROTATION"]:
            jti = refresh.get(settings.SIMPLE_JWT["JTI_CLAIM"])
            if BlacklistedToken.objects.filter(token__jti=jti).exists():
                raise ValidationError("token is blacklisted")

        return {}
