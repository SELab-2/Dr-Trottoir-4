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
        candidates = Building.objects.filter(id=building)
        if len(candidates) != 1:
            return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        if not version:
            # latest version ophalen
            instances = Manual.objects.filter(building=candidates[0])
            if len(instances) == 0:
                version = 1
            else:
                version = max([instance.version_number for instance in instances]) + 1
        pb = Manual(building=candidates[0], file=file, version_number=version)
        try:
            pb.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        pb.save()
        serializer = ManualSerializer(pb)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ManualView(APIView):
    def get(self, request, manual_id):
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return Response("There is no manual with that id", status=status.HTTP_400_BAD_REQUEST)
        serializer = ManualSerializer(manual_instances[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, manual_id):
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return Response("There is no manual with that id", status=status.HTTP_400_BAD_REQUEST)
        manual_instances[0].delete()
        return Response(status=status.HTTP_200_OK)

    def patch(self, request, manual_id):
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return Response(
                "Object with given id does not exist.",
                status=status.HTTP_400_BAD_REQUEST
            )
        instance = manual_instances[0]
        data = request.data
        building = data.get("building")
        candidates = Building.objects.filter(id=building)
        if len(candidates) != 1:
            return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        instance.building = candidates[0]
        try:
            instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


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
