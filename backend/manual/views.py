from base.models import Manual, Building
from base.serializers import ManualSerializer
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    def post(self, request):
        data = request.data
        building = data.get("building")
        file = request.FILES.get("file")
        # version is optional
        version = data.get("version_number")
        if not building or not file:
            return Response('"building" and "file" fields are required',
                            status.HTTP_400_BAD_REQUEST)
        if not version:
            # latest version ophalen
            instances = Manual.objects.all()
            version = max([instance.version_number for instance in instances]) + 1
        candidates = Building.objects.filter(id=building)
        if len(candidates) != 1:
            return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        pb = Manual(building=candidates[0], file=file, version_number=version)
        try:
            pb.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        pb.save()
        serializer = ManualSerializer(pb)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
