from base.models import StudentAtBuildingOnTour
from base.serializers import StudBuildTourSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class AllView(APIView):
    def get(self, request):
        """
        Get all data
        """
        picture_building_instances = StudentAtBuildingOnTour.objects.all()

        serializer = StudBuildTourSerializer(picture_building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
