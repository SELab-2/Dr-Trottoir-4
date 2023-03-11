from base.models import Manual, Building
from base.serializers import ManualSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    pass


class ManualView(APIView):
    pass


class ManualBuildingView(APIView):
    def get(self, request, building_id):
        candidates = Building.objects.filter(id=building_id)
        if len(candidates) != 1:
            return Response('building_id was not valid', status=status.HTTP_400_BAD_REQUEST)
        building = candidates[0]
        picture_building_instances = Manual.objects.filter(building=building)

        serializer = ManualSerializer(picture_building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ManualsView(APIView):
    def get(self, request):
        instances = Manual.objects.all()

        serializer = ManualSerializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
