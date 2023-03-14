import json

from rest_framework import permissions
from rest_framework.views import APIView

from base.models import User
from base.serializers import UserSerializer
from util.request_response_util import *


def _try_adding_region_to_user_instance(user_instance, region_value):
    try:
        user_instance.region.add(region_value)
    except IntegrityError as e:
        user_instance.delete()
        return Response(str(e.__cause__), status=status.HTTP_400_BAD_REQUEST)


class DefaultUser(APIView):
    serializer_class = UserSerializer
    # TODO: authorization
    # permission_classes = [permissions.IsAuthenticated]

    # TODO: in order for this to work, you have to pass a password
    #  In the future, we probably won't use POST this way anymore (if we work with the whitelist method)
    def post(self, request):
        """
        Create a new user
        """
        data = request_to_dict(request.data)

        user_instance = User()

        for key in data.keys():
            if key in vars(user_instance):
                setattr(user_instance, key, data[key])

        if r := try_full_clean_and_save(user_instance):
            return r

        user_instance.save()

        # Now that we have an ID, we can look at the many-to-many relationship region

        print("beginnen met REGIONNNNNNN ")

        if "region" in data.keys():
            region_dict = json.loads(data["region"])
            for value in region_dict.values():
                if r := _try_adding_region_to_user_instance(user_instance, value):
                    return r

        if r := try_full_clean_and_save(user_instance, rm=True):
            return r

        serializer = UserSerializer(user_instance)
        return post_succes(serializer)


class UserIndividualView(APIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        """
        Get info about user with given id
        """

        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return bad_request(object_name="User")

        serializer = UserSerializer(user_instance[0])
        return get_succes(serializer)

    def delete(self, request, user_id):
        """
        Delete user with given id
        """
        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return bad_request(object_name="User")

        user_instance[0].delete()
        return delete_succes()

    def patch(self, request, user_id):
        """
        Edit user with given id
        """
        user_instance = User.objects.filter(id=user_id)

        if not user_instance:
            return bad_request(object_name="User")
        user_instance = user_instance[0]

        data = request_to_dict(request.data)

        for key in data.keys():
            if key in vars(user_instance):
                setattr(user_instance, key, data[key])

        if r := try_full_clean_and_save(user_instance):
            return r

        # Now that we have an ID, we can look at the many-to-many relationship region
        if "region" in data.keys():
            region_dict = json.loads(data["region"])
            user_instance.region.clear()
            for value in region_dict.values():
                if r := _try_adding_region_to_user_instance(user_instance, value):
                    return r

        if r := try_full_clean_and_save(user_instance, rm=True):
            return r

        serializer = UserSerializer(user_instance)
        return patch_succes(serializer)


class AllUsersView(APIView):
    serializer_class = UserSerializer

    def get(self, request):
        """
        Get all users
        """
        user_instances = User.objects.all()
        serializer = UserSerializer(user_instances, many=True)
        return get_succes(serializer)
