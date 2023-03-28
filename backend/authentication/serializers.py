from allauth.account.adapter import get_adapter
from allauth.utils import email_address_exists
from dj_rest_auth import serializers as auth_serializers
from dj_rest_auth.jwt_auth import unset_jwt_cookies
from dj_rest_auth.serializers import PasswordResetSerializer, LoginSerializer
from django.utils.translation import gettext_lazy as _
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.forms import CustomAllAuthPasswordResetForm
from base.models import User, Lobby
from base.serializers import UserSerializer
from config import settings
from users.views import TRANSLATE
from util.request_response_util import set_keys_of_instance, try_full_clean_and_save


class CustomSignUpSerializer(Serializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = PhoneNumberField(required=True)
    password1 = serializers.CharField(required=True, write_only=True)
    password2 = serializers.CharField(required=True, write_only=True)
    verification_code = serializers.CharField(required=True, write_only=True)

    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if email and email_address_exists(email):
            raise serializers.ValidationError(
                _("a user is already registered with this e-mail address"),
            )
        return email

    def validate(self, data):
        # check if the email address is in the lobby
        lobby_instance = Lobby.objects.filter(email=data["email"]).first()
        if not lobby_instance:
            raise auth_serializers.ValidationError(
                {
                    "email": _(
                        f"{data['email']} has no entry in the lobby, you must contact an admin to gain access to the platform"
                    ),
                }
            )
        # check if the verification code is valid
        if lobby_instance.verification_code != data["verification_code"]:
            raise auth_serializers.ValidationError({"verification_code": _(f"invalid verification code")})
        # add role to the validated data
        data["role"] = lobby_instance.role_id
        # check if passwords match
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError({"message": _("the two password fields didn't match.")})
        # add password to the validated data
        data["password"] = data["password1"]

        return data

    def create(self, validated_data):
        user_instance = User()

        set_keys_of_instance(user_instance, validated_data, TRANSLATE)

        if r := try_full_clean_and_save(user_instance):
            raise auth_serializers.ValidationError(r.data)

        user_instance.save()

        return user_instance

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.phone_number = validated_data.get("phone_number", instance.phone_number)
        return instance


class CustomTokenRefreshSerializer(Serializer):
    def validate(self, incoming_data):
        # extract the request
        request = self.context["request"]
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
    def validate(self, incoming_data):
        # extract the request
        request = self.context["request"]
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


class CustomLoginResponseSerializer(LoginSerializer):
    message = serializers.CharField()
    user = UserSerializer()


class CustomLogoutSerializer(serializers.Serializer):
    message = serializers.CharField()

    def logout_user(self, request):
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
