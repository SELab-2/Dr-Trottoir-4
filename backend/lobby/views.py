from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import Lobby
from base.permissions import IsAdmin, IsSuperStudent
from base.serializers import LobbySerializer
from util.request_response_util import *


TRANSLATE = {"role": "role_id"}

_VERIFICATION_CODE = "verification_code"


def _add_verification_code_to_req_data(data):
    if _VERIFICATION_CODE not in data:
        data[_VERIFICATION_CODE] = get_unique_uuid()


class DefaultLobby(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = LobbySerializer

    @extend_schema(
        responses={201: LobbySerializer, 400: None},
    )
    def post(self, request):
        """
        Create a new whitelisted email
        """
        data = request_to_dict(request.data)

        _add_verification_code_to_req_data(data)

        lobby_instance = Lobby()

        set_keys_of_instance(lobby_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(lobby_instance):
            return r

        return post_success(LobbySerializer(lobby_instance))


class LobbyIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = LobbySerializer

    @extend_schema(responses={200: LobbySerializer, 400: None})
    def get(self, request, lobby_id):
        """
        Get info about an EmailWhitelist with given id
        """
        lobby_instance = Lobby.objects.filter(id=lobby_id)

        if not lobby_instance:
            return bad_request("EmailWhitelist")

        return get_success(LobbySerializer(lobby_instance[0]))

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, lobby_id):
        """
        Patch EmailWhitelist with given id
        """
        lobby_instance = Lobby.objects.filter(id=lobby_id)

        if not lobby_instance:
            return bad_request("EmailWhitelist")

        lobby_instance[0].delete()

        return delete_success()

    @extend_schema(responses={204: None, 400: None, 403: None})
    def patch(self, request, email_whitelist_id):
        """
        Patch EmailWhitelist with given id
        """
        email_whitelist_instance = Lobby.objects.filter(id=email_whitelist_id)

        if not email_whitelist_instance:
            return bad_request("EmailWhitelist")

        email_whitelist_instance = email_whitelist_instance[0]
        data = request_to_dict(request.data)

        if _VERIFICATION_CODE in data:
            return Response("Not permitted to change the verification code", status=403)

        set_keys_of_instance(email_whitelist_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(email_whitelist_instance):
            return r

        return patch_success(LobbySerializer(email_whitelist_instance))


class LobbyRefreshVerificationCodeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = LobbySerializer

    @extend_schema(
        description="Generate a new token. The body of the request is ignored.",
        request=None,
        responses={204: None, 400: None},
    )
    def post(self, request, lobby_id):
        """
        Do a POST with an empty body on `lobby/new_verification_code/ to generate a new verification code
        """
        lobby_instance = Lobby.objects.filter(id=lobby_id)

        if not lobby_instance:
            return bad_request("EmailWhitelist")

        lobby_instance = lobby_instance[0]
        lobby_instance.verification_code = get_unique_uuid()

        if r := try_full_clean_and_save(lobby_instance):
            return r

        return post_success(LobbySerializer(lobby_instance))


class LobbyAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = LobbySerializer

    def get(self, request):
        """
        Get info about the EmailWhiteList with given id
        """
        lobby_instance = Lobby.objects.all()
        serializer = LobbySerializer(lobby_instance, many=True)
        return get_success(serializer)
