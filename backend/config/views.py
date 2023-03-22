from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class RootDefault(APIView):
    permission_classes = [IsAuthenticated]

    def get(self):
        return Response(
            {"message", "Hello from the DrTrottoir API!"},
            status=status.HTTP_200_OK,
        )
