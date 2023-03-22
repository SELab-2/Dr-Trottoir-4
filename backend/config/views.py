from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema


class RootDefault(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: None, 400: None, 403: None, 401: None})
    def get(self):
        return Response(
            {"message", "Hello from the DrTrottoir API!"},
            status=status.HTTP_200_OK,
        )
