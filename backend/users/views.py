from django.core.exceptions import ValidationError
from rest_framework import permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from base.models import User, Region
from base.serializers import UserSerializer

import json


# TODO: code quality isn't the best yet


# TODO: ergens een file maken met functies die in alle views nuttig zijn over meerdere apps
#  Handig zodat we bijvoorbeeld overal dezelfde HTTP code gebruiken
def _bad_request():
    return Response(
        {"res": "Object with given building ID does not exists."},
        status=status.HTTP_400_BAD_REQUEST
    )


class DefaultUser(APIView):

    # TODO: authorization
    # permission_classes = [permissions.IsAuthenticated]

    # TODO:
    # Document the usage of region:
    #  region -> "{"arbitraryname1": 1, "arbitraryname2": 2}"
    def post(self, request):
        """
        Create a new user
        """
        data = request.data.dict()

        user_instance = User()

        for key in data.keys():
            print(f"----------> {key}")
            if key in vars(user_instance):
                setattr(user_instance, key, data[key])
        try:
            user_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        user_instance.save()

        # Now that we have an ID, we can look at the many-to-many relationship region
        # TODO: make sure to test 'region' well!
        if "region" in data.keys():
            # print(data)
            # print(data["region"])
            region_dict = json.loads(data["region"])
            # print(region_dict)
            for value in region_dict.values():
                user_instance.region.add(value)
        # TODO: what if this fails? the previous instance is already saved
        try:
            user_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        user_instance.save()

        serializer = UserSerializer(user_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserIndividualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        """
        Get info about user with given id
        """

        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return _bad_request()

        serializer = UserSerializer(user_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        """
        Delete user with given id
        """
        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return _bad_request()

        user_instance[0].delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, user_id):
        """
        Edit user with given id
        """
        user_instance = User.objects.filter(id=user_id)
        if not user_instance:
            return _bad_request()
        user_instance = user_instance[0]

        data = request.data.dict()

        for key in data.keys():
            if key in vars(user_instance):
                setattr(user_instance, key, data[key])
        try:
            user_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        user_instance.save()

        # Now that we have an ID, we can look at the many-to-many relationship region
        if "region" in data.keys():
            region_dict = json.loads(data["region"])
            user_instance.region.clear()
            for value in region_dict.values():
                user_instance.region.add(value)

        try:
            user_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        user_instance.save()

        serializer = UserSerializer(user_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AllUsersView(APIView):

    def get(self, request):
        """
        Get all users
        """

        user_instances = User.objects.all()

        if not user_instances:
            return Response(
                {"res": "No users found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
