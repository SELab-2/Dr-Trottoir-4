from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView

from base.models import EmailWhitelist
from base.serializers import EmailWhitelistSerializer
from util.request_response_util import *


def _add_verification_code_if_necessary(data):
    if "verification_code" not in data:
        data["verification_code"] = get_unique_uuid()


class DefaultEmailWhiteList(APIView):
    serializer_class = EmailWhitelistSerializer

    @extend_schema(
        description="If you do not set a verification_code yourself, the backend will provide a safe one for you.",
        responses={201: EmailWhitelistSerializer, 400: None})
    def post(self, request):
        """
        Create a new whitelisted email
        """
        data = request_to_dict(request.data)

        _add_verification_code_if_necessary(data)

        email_whitelist_instance = EmailWhitelist()

        set_keys_of_instance(email_whitelist_instance, data)

        if r := try_full_clean_and_save(email_whitelist_instance):
            return r

        return post_success(EmailWhitelistSerializer(email_whitelist_instance))


class EmailWhiteListIndividualView(APIView):
    serializer_class = EmailWhitelistSerializer

    @extend_schema(responses={200: EmailWhitelistSerializer, 400: None})
    def get(self, request, email_whitelist_id):
        """
        Get info about an EmailWhitelist with given id
        """
        email_whitelist_instance = EmailWhitelist.objects.filter(id=email_whitelist_id)

        if not email_whitelist_instance:
            return bad_request("EmailWhitelist")

        return get_success(EmailWhitelistSerializer(email_whitelist_instance[0]))

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, email_whitelist_id):
        """
        Patch EmailWhitelist with given id
        """
        email_whitelist_instance = EmailWhitelist.objects.filter(id=email_whitelist_id)

        if not email_whitelist_instance:
            return bad_request("EmailWhitelist")

        email_whitelist_instance[0].delete()

        return delete_success()

    @extend_schema(responses={204: None, 400: None})
    def patch(self, request, email_whitelist_id):
        """
        Patch EmailWhitelist with given id
        """
        email_whitelist_instance = EmailWhitelist.objects.filter(id=email_whitelist_id)

        if not email_whitelist_instance:
            return bad_request("EmailWhitelist")

        email_whitelist_instance = email_whitelist_instance[0]
        data = request_to_dict(request.data)
        _add_verification_code_if_necessary(data)

        set_keys_of_instance(email_whitelist_instance)

        if r := try_full_clean_and_save(email_whitelist_instance):
            return r

        return patch_success(EmailWhitelistSerializer(email_whitelist_instance))


class EmailWhiteListNewVerificationCode(APIView):
    serializer_class = EmailWhitelistSerializer

    @extend_schema(description="Generate a new token. The body of the request is ignored.",
                   responses={204: None, 400: None})
    def post(self, request, email_whitelist_id):
        """
        Do a POST with an empty body on `email_whitelist/new_verification_code/ to generate a new verification code
        """
        email_whitelist_instance = EmailWhitelist.objects.filter(id=email_whitelist_id)

        if not email_whitelist_instance:
            return bad_request("EmailWhitelist")

        email_whitelist_instance = email_whitelist_instance[0]
        email_whitelist_instance.verification_code = get_unique_uuid()

        if r := try_full_clean_and_save(email_whitelist_instance):
            return r

        return post_success(EmailWhitelistSerializer(email_whitelist_instance))


class EmailWhiteListAllView(APIView):
    serializer_class = EmailWhitelistSerializer

    def get(self, request):
        """
        Get info about the EmailWhiteList with given id
        """
        email_whitelist_instances = EmailWhitelist.objects.all()
        serializer = EmailWhitelistSerializer(email_whitelist_instances, many=True)
        return get_success(serializer)
