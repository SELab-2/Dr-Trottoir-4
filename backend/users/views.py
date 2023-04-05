from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import User
from base.permissions import (
    IsAdmin,
    IsSuperStudent,
    OwnerAccount,
    CanEditUser,
    CanEditRole,
    CanDeleteUser,
    CanCreateUser,
)
from base.serializers import UserSerializer
from users.user_utils import add_regions_to_user
from util.request_response_util import *

TRANSLATE = {"role": "role_id"}

DESCRIPTION = "For region, pass a list of id's. For example: [1, 2, 3]"


class DefaultUser(APIView):
    permission_classes = [IsAuthenticated, CanCreateUser]
    serializer_class = UserSerializer

    @extend_schema(responses=get_docs(UserSerializer))
    def get(self, request):
        """
        Get the current user info
        """
        serializer = UserSerializer(request.user)
        return get_success(serializer)

    @extend_schema(responses=post_docs(UserSerializer))
    def post(self, request):
        """
        Create a new user
        """
        data = request_to_dict(request.data)

        user_instance = User()

        set_keys_of_instance(user_instance, data, TRANSLATE)

        self.check_object_permissions(request, user_instance)

        if r := try_full_clean_and_save(user_instance):
            return r

        # Now that we have an ID, we can look at the many-to-many relationship region

        if r := add_regions_to_user(user_instance, data["region"]):
            user_instance.delete()
            return r

        serializer = UserSerializer(user_instance)
        return post_success(serializer)


class UserIndividualView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdmin | IsSuperStudent | OwnerAccount,
        CanEditUser,
        CanEditRole,
        CanDeleteUser,
    ]
    serializer_class = UserSerializer

    @extend_schema(responses=get_docs(UserSerializer))
    def get(self, request, user_id):
        """
        Get info about user with given id
        """
        user_instance = User.objects.filter(id=user_id)

        if not user_instance:
            return bad_request(object_name="User")
        user_instance = user_instance[0]

        self.check_object_permissions(request, user_instance)

        serializer = UserSerializer(user_instance)
        return get_success(serializer)

    @extend_schema(responses=delete_docs())
    def delete(self, request, user_id):
        """
        Delete user with given id
        We don't actually delete a user, we put the user on inactive mode
        """
        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return bad_request(object_name="User")
        user_instance = user_instance[0]

        self.check_object_permissions(request, user_instance)

        user_instance.is_active = False
        user_instance.save()

        return delete_success()

    @extend_schema(responses=patch_docs(UserSerializer))
    def patch(self, request, user_id):
        """
        Edit user with given id
        """
        user_instance = User.objects.filter(id=user_id)

        if not user_instance:
            return bad_request(object_name="User")

        user_instance = user_instance[0]

        self.check_object_permissions(request, user_instance)

        data = request_to_dict(request.data)

        set_keys_of_instance(user_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(user_instance):
            return r

        # Now that we have an ID, we can look at the many-to-many relationship region
        if data.get("region") and (r := add_regions_to_user(user_instance, data["region"])):
            return r

        serializer = UserSerializer(user_instance)
        return patch_success(serializer)


class AllUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = UserSerializer

    def get(self, request):
        """
        Get all users
        """
        include_inactive = request.GET.get("include-inactive", "false")
        if include_inactive.lower() == "true":
            user_instances = User.objects.all()
        else:
            user_instances = User.objects.filter(is_active=True)

        serializer = UserSerializer(user_instances, many=True)
        return get_success(serializer)
