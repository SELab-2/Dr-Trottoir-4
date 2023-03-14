from base.models import PictureBuilding, Building
from base.serializers import PictureBuildingSerializer
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

class Default(APIView):
    serializer_class = PictureBuildingSerializer

    @extend_schema(
        responses={201: PictureBuildingSerializer,
                   400: None}
    )
    def post(self, request):
        data = request.data
        building = data.get("building")
        picture = request.FILES.get("picture")
        description = data.get("description")
        timestamp = data.get("timestamp")
        picture_type = data.get("type")
        if not building or not picture or not description or not timestamp or not picture_type:
            return Response('"building", "picture", "description", "timestamp" and "type" fields are required',
                            status.HTTP_400_BAD_REQUEST)
        candidates = Building.objects.filter(id=building)
        if len(candidates) != 1:
            return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        pb = PictureBuilding(building=candidates[0], picture=picture, description=description, timestamp=timestamp,
                             type=picture_type)
        try:
            pb.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        pb.save()
        serializer = PictureBuildingSerializer(pb)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PictureBuildingIndividualView(APIView):
    serializer_class = PictureBuildingSerializer

    @extend_schema(
        responses={200: PictureBuildingSerializer,
                   400: None}
    )
    def get(self, request, pictureBuilding_id):
        pictureBuilding_instance = PictureBuilding.objects.filter(id=pictureBuilding_id)

        if len(pictureBuilding_instance) != 1:
            return Response(
                {"res": "Object with given pictureBuilding id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = PictureBuildingSerializer(pictureBuilding_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        responses={204: None,
                   400: None,
                   501: None}
    )
    def patch(self, request, pictureBuilding_id):
        # fixme picture itself cannot currently be patched
        pictureBuilding_candidates = PictureBuilding.objects.filter(id=pictureBuilding_id)
        if len(pictureBuilding_candidates) != 1:
            return Response(
                {"res": "Object with given pictureBuilding id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        pictureBuilding_instance = pictureBuilding_candidates[0]
        data = request.data
        building = data.get("building")
        picture = data.get("picture")
        description = data.get("description")
        timestamp = data.get("timestamp")
        type = data.get("type")
        if building:
            candidates = Building.objects.filter(id=building)
            if len(candidates) != 1:
                return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
            pictureBuilding_instance.building = candidates[0]
        if picture:
            return Response('"picture" field cannot currently be changed', status.HTTP_501_NOT_IMPLEMENTED)
        if description:
            pictureBuilding_instance.description = description
        if timestamp:
            pictureBuilding_instance.timestamp = timestamp
        if type:
            pictureBuilding_instance.type = type
        try:
            pictureBuilding_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        pictureBuilding_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        responses={204: None,
                   400: None}
    )
    def delete(self, request, pictureBuilding_id):
        """
        delete a pictureBuilding from the database
        """
        pictureBuilding_instance = PictureBuilding.objects.filter(id=pictureBuilding_id)
        if len(pictureBuilding_instance) != 1:
            return Response(
                {"res": "Object with given pictureBuilding id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        pictureBuilding_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PicturesOfBuildingView(APIView):
    serializer_class = PictureBuildingSerializer

    @extend_schema(
        responses={200: PictureBuildingSerializer,
                   400: None}
    )
    def get(self, request, building_id):
        candidates = Building.objects.filter(id=building_id)
        if len(candidates) != 1:
            return Response('building_id was not valid', status=status.HTTP_400_BAD_REQUEST)
        building = candidates[0]
        picture_building_instances = PictureBuilding.objects.filter(building=building)

        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AllPictureBuildingsView(APIView):
    serializer_class = PictureBuildingSerializer

    def get(self, request):
        """
        Get all pictureBuilding
        """
        picture_building_instances = PictureBuilding.objects.all()

        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
