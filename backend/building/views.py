from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from base.models import Building
from base.serializers import BuildingSerializer


class BuildingIndividualView(APIView):

    # TODO: permission classes

    def get(self, request, building_id):
        """
        Get info about building with given id
        """
        building_instance = Building.objects.get(id=building_id)

        if not building_instance:
            return Response(
                {"res": "Object with given building ID does not exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BuildingSerializer(building_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # TODO: Also implement delete, patch ...


class AllBuildingsView(APIView):

    def get(self, request):
        """
        Get all buildings
        """
        building_instances = Building.objects.all()

        if not building_instances:
            # TODO: testen of dit niet gewoon een leeg object teruggeeft
            return Response(
                {"res": "No buildings found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BuildingSerializer(building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BuildingOwnerView(APIView):

    def get(self, request, owner_id):
        """
        Get all buildings owned by syndic with given id
        """
        building_instance = Building.objects.filter(syndic=owner_id)

        if not building_instance:
            return Response(
                {"res": "Object with given building ID does not exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BuildingSerializer(building_instance, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
