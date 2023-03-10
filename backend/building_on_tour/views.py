from base.models import Building, Tour, BuildingOnTour
from base.serializers import BuildingTourSerializer
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    def post(self, request):
        """
        Create a new BuildingOnTour with data from post
        """
        data = request.data
        tour = data.get("tour")
        building = data.get("building")
        index = data.get("index")
        if not tour or not building or not index:
            return Response('"tour", "building" and "index" fields are required', status.HTTP_400_BAD_REQUEST)
        # checking if tour id exists
        t = Tour.objects.filter(id=tour)
        if len(t) != 1:
            return Response('"tour" field was not valid', status.HTTP_400_BAD_REQUEST)
        tour_instance = t[0]
        # checking if building id exists
        b = Building.objects.filter(id=building)
        if len(b) != 1:
            return Response('"building" field was not valid', status.HTTP_400_BAD_REQUEST)
        building_instance = b[0]
        newTour = BuildingOnTour(tour=tour_instance, building=building_instance, index=index)
        try:
            newTour.full_clean()
        except ValidationError as e:
            return Response(e.message_dict["__all__"], status.HTTP_400_BAD_REQUEST)
        newTour.save()
        serializer = BuildingTourSerializer(newTour)
        return Response(serializer.data, status.HTTP_201_CREATED)


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
