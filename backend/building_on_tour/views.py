from base.models import Building, Tour, BuildingOnTour
from base.serializers import BuildingTourSerializer
from django.core.exceptions import NON_FIELD_ERRORS
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class AllBuildingToursView(APIView):
    def get(self, request):
        """
        Get all buildings on tours
        """
        buildingOnTourInstances = BuildingOnTour.objects.all()

        if not buildingOnTourInstances:
            return Response(
                {"res", "No buildings on tours found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BuildingTourSerializer(buildingOnTourInstances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
