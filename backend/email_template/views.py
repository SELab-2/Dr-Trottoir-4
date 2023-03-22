from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import EmailTemplate
from base.permissions import IsAdmin, IsSuperStudent
from base.serializers import EmailTemplateSerializer
from util.request_response_util import *


class DefaultEmailTemplate(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = EmailTemplateSerializer

    @extend_schema(responses={201: EmailTemplateSerializer, 400: None})
    def post(self, request):
        """
        Create a new EmailTemplate
        """
        data = request_to_dict(request.data)

        email_template_instance = EmailTemplate()

        set_keys_of_instance(email_template_instance, data)

        if r := try_full_clean_and_save(email_template_instance):
            return r

        return post_success(EmailTemplateSerializer(email_template_instance))


class EmailTemplateIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = EmailTemplateSerializer

    @extend_schema(responses={200: EmailTemplateSerializer, 400: None})
    def get(self, request, email_template_id):
        """
        Get info about an EmailTemplate with given id
        """
        email_template_instance = EmailTemplate.objects.filter(id=email_template_id)

        if not email_template_instance:
            return bad_request("EmailTemplate")

        return get_success(EmailTemplateSerializer(email_template_instance[0]))

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, email_template_id):
        """
        Delete EmailTemplate with given id
        """
        email_template_instance = EmailTemplate.objects.filter(id=email_template_id)

        if not email_template_instance:
            return bad_request("EmailTemplate")

        email_template_instance[0].delete()
        return delete_success()

    @extend_schema(responses={204: None, 400: None})
    def patch(self, request, email_template_id):
        """
        Edit EmailTemplate with given id
        """
        email_template_instance = EmailTemplate.objects.filter(id=email_template_id)

        if not email_template_instance:
            return bad_request("EmailTemplate")

        email_template_instance = email_template_instance[0]
        data = request_to_dict(request.data)

        set_keys_of_instance(email_template_instance, data)

        if r := try_full_clean_and_save(email_template_instance):
            return r

        return patch_success(EmailTemplateSerializer(email_template_instance))


class EmailTemplateAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = EmailTemplateSerializer

    def get(self, request):
        """
        Get all EmailTemplates in the database
        """
        email_template_instances = EmailTemplate.objects.all()
        serializer = EmailTemplateSerializer(email_template_instances, many=True)
        return get_success(serializer)
