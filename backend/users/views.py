from django.core.exceptions import ValidationError
from rest_framework import permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from base.models import User
from users.serializers import UserSerializer


# class UserViewSet(viewsets.ModelViewSet):
#    queryset = User.objects.all()
#    serializer_class = UserSerializer
#    permission_classes = [IsAuthenticated]

# TODO: ergens een file maken met functies die in alle views nuttig zijn over meerdere apps
#  Handig zodat we bijvoorbeeld overal dezelfde HTTP code gebruiken
def _bad_request():
    return Response(
        {"res": "Object with given building ID does not exists."},
        status=status.HTTP_400_BAD_REQUEST
    )


class UserIndividualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        """
        Get info about user with given id
        """

        user_instance = User.objects.get(id=user_id)

        if not user_instance:
            return _bad_request()

        serializer = UserSerializer(user_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


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


