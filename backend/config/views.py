from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema


class RootDefault(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: None, 400: None, 403: None, 401: None},
        description='If you are logged in, you should see "Hello from the DrTrottoir API!". You should also be able to see your unique user id.',
    )
    def get(self, request):
        return Response(
            {"res": "Hello from the DrTrottoir API!", "id": request.user.id},
            status=status.HTTP_200_OK,
        )
