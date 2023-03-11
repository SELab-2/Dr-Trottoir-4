from base.models import PictureBuilding, Building
from base.serializers import PictureBuildingSerializer
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    def post(self, request):
        """
        Create a new tour with name from post
        """
        data = request.data
        print(data)
        print(request.FILES)
        building = data.get("building")
        picture = request.FILES.get("picture")
        print(picture)
        description = data.get("description")
        timestamp = data.get("timestamp")
        picture_type = data.get("type")
        # print(picture)
        print(type(picture))
        if not building or not picture or not description or not timestamp or not picture_type:
            return Response('"building", "picture", "description", "timestamp" and "type" fields are required',
                            status.HTTP_400_BAD_REQUEST)
        # todo fix creating an image
        candidates = Building.objects.filter(id=building)
        if len(candidates) != 1:
            return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        pb = PictureBuilding(building=candidates[0], picture=picture, description=description, timestamp=timestamp, type=picture_type)
        pb.save()
        return Response(status=status.HTTP_201_CREATED)


class PictureBuildingIndividualView(APIView):
    def get(self, request, pictureBuilding_id):
        """
        Get info about a Tour with given id
        """
        pictureBuilding_instance = PictureBuilding.objects.filter(id=pictureBuilding_id)

        if len(pictureBuilding_instance) != 1:
            return Response(
                {"res": "Object with given pictureBuilding id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = PictureBuildingSerializer(pictureBuilding_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pictureBuilding_id):
        """
        edit info about a tour with given id
        # fixme picture itself cannot currently be patched
        """
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
            # return Response('"name", "region" and "modified_at" fields are required', status.HTTP_400_BAD_REQUEST)
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
            print(e)
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        pictureBuilding_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

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


class AllPictureBuildingsView(APIView):
    def get(self, request):
        """
        Get all tours
        """
        picture_building_instances = PictureBuilding.objects.all()

        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
