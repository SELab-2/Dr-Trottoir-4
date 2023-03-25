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


# In GET, you only get active users
# Except when you explicitly pass a parameter 'include_inactive' to the body of the request and set it as true
# If you
def _include_inactive(request) -> bool:
    data = request_to_dict(request.data)
    if "include_inactive" in data:
        return data["include_inactive"]
    return False


class DefaultUser(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent, CanCreateUser]
    serializer_class = UserSerializer

    # TODO: in order for this to work, you have to pass a password
    #  In the future, we probably won't use POST this way anymore (if we work with the whitelist method)
    #  However, an easy workaround would be to add a default value to password (in e.g. `clean`)
    #     -> probably the easiest way
    @extend_schema(description=DESCRIPTION, responses={201: UserSerializer, 400: None})
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

    @extend_schema(responses={200: UserSerializer, 400: None})
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

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, user_id):
        """
        Delete user with given id
        We don't acutally delete a user, we put the user on inactive mode
        """
        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return bad_request(object_name="User")
        user_instance = user_instance[0]

        self.check_object_permissions(request, user_instance)

        user_instance.is_active = False
        user_instance.save()

        return delete_success()

    @extend_schema(description=DESCRIPTION, responses={200: UserSerializer, 400: None})
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
        if r := add_regions_to_user(user_instance, data["region"]):
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
        if _include_inactive(request):
            user_instances = User.objects.all()
        else:
            user_instances = User.objects.filter(is_active=True)
        serializer = UserSerializer(user_instances, many=True)
        return get_success(serializer)
