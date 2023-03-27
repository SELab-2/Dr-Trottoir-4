from dj_rest_auth import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.forms import CustomAllAuthPasswordResetForm
from base.models import User
from config import settings
from users.user_utils import add_regions_to_user
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
        raw_regions = data.get('region')
        if raw_regions:
            add_regions_to_user(user, raw_regions)
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


class CustomPasswordResetSerializer(PasswordResetSerializer):
    def validate_email(self, value):
        # use the custom reset form
        self.reset_form = CustomAllAuthPasswordResetForm(data=self.initial_data)
        if not self.reset_form.is_valid():
            raise serializers.ValidationError(self.reset_form.errors)

        return value
