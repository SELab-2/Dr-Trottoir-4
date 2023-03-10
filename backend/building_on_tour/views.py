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


class BuildingTourIndividualView(APIView):
    def get(self, request, buildingTour_id):
        """
        Get info about a BuildingOnTour with given id
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=buildingTour_id)

        if len(building_on_tour_instance) != 1:
            return Response(
                {"res": "Object with given building_on_tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = BuildingTourSerializer(building_on_tour_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, buildingTour_id):
        """
        edit info about a BuildingOnTour with given id
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=buildingTour_id)

        if len(building_on_tour_instance) != 1:
            return Response(
                {"res": "Object with given building_on_tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        data = request.data
        tour = data.get("tour")
        building = data.get("building")
        index = data.get("index")

        if tour:
            # checking if tour id exists
            t = Tour.objects.filter(id=tour)
            if len(t) != 1:
                return Response('"tour" field was not valid', status.HTTP_400_BAD_REQUEST)
            tour_instance = t[0]
            building_on_tour_instance.tour = tour_instance
        if building:
            # checking if building id exists
            b = Building.objects.filter(id=building)
            if len(b) != 1:
                return Response('"building" field was not valid', status.HTTP_400_BAD_REQUEST)
            building_instance = b[0]
            building_on_tour_instance.building = building_instance
        if index:
            building_on_tour_instance.index = index
        try:
            building_on_tour_instance.full_clean()
        except ValidationError as e:
            if "tour" in e.message_dict:
                return Response(e.message_dict["tour"], status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(e.message_dict["__all__"], status=status.HTTP_400_BAD_REQUEST)
        building_on_tour_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, buildingTour_id):
        """
        delete a BuildingOnTour from the database
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=buildingTour_id)

        if len(building_on_tour_instance) != 1:
            return Response(
                {"res": "Object with given building_on_tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        building_on_tour_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class AllBuildingToursView(APIView):
    def get(self, request):
        """
        Get all buildings on tours
        """
        buildingOnTourInstances = BuildingOnTour.objects.all()

        serializer = BuildingTourSerializer(buildingOnTourInstances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
