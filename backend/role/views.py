from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from authorisation.permissions import IsAdmin, IsSuperStudent
from base.models import Role
from base.serializers import RoleSerializer
from util.request_response_util import *


class DefaultRoleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """
        Create a new role
        """
        data = request_to_dict(request.data)
        role_instance = Role()

        set_keys_of_instance(role_instance, data)

        if r := try_full_clean_and_save(role_instance):
            return r

        serializer = RoleSerializer(role_instance)
        return post_success(serializer)


class RoleIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def get(self, request, role_id):
        """
        Get info about a Role with given id
        """
        role_instance = Role.objects.filter(id=role_id)

        if not role_instance:
            return bad_request("Role")

        serializer = RoleSerializer(role_instance[0])
        return get_success(serializer)

    def delete(self, request, role_id):
        """
        Delete a Role with given id
        """
        role_instance = Role.objects.filter(id=role_id)

        if not role_instance:
            return bad_request("Role")

        role_instance[0].delete()
        return delete_success()

    def patch(self, request, role_id):
        """
        Edit info about a Role with given id
        """
        role_instance = Role.objects.filter(id=role_id)

        if not role_instance:
            return bad_request("Role")

        role_instance = role_instance[0]

        data = request_to_dict(request.data)

        set_keys_of_instance(role_instance, data)

        if r := try_full_clean_and_save(role_instance):
            return r

        return patch_success(RoleSerializer(role_instance))


class AllRolesView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def get(self, request):
        """
        Get all roles
        """
        role_instances = Role.objects.all()
        serializer = RoleSerializer(role_instances, many=True)
        return get_success(serializer)
