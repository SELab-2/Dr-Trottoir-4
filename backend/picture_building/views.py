from rest_framework.views import APIView

from base.models import PictureBuilding, Building
from base.serializers import PictureBuildingSerializer
from util.request_response_util import *

TRANSLATE = {"building": "building_id"}

class Default(APIView):
    def post(self, request):
        """
        Create a new PictureBuilding
        """
        data = request_to_dict(request.data)
        picture_building_instance = PictureBuilding()

        set_keys_of_instance(picture_building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(picture_building_instance):
            return r

        return post_success(PictureBuildingSerializer(picture_building_instance))


class PictureBuildingIndividualView(APIView):
    def get(self, request, picture_building_id):
        """
        Get PictureBuilding with given id
        """
        picture_building_instance = PictureBuilding.objects.filter(id=picture_building_id)

        if len(picture_building_instance) != 1:
            return bad_request("PictureBuilding")
        serializer = PictureBuildingSerializer(picture_building_instance[0])
        return get_success(serializer)

    def patch(self, request, picture_building_id):
        """
        Edit info about PictureBuilding with given id
        """
        picture_building_instance = PictureBuilding.objects.filter(id=picture_building_id)
        if not picture_building_instance:
            return bad_request("PictureBuilding")

        picture_building_instance = picture_building_instance[0]

        data = request_to_dict(request.data)

        set_keys_of_instance(picture_building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(picture_building_instance):
            return r

        return patch_success(PictureBuildingSerializer(picture_building_instance))

    def delete(self, request, picture_building_id):
        """
        delete a pictureBuilding from the database
        """
        picture_building_instance = PictureBuilding.objects.filter(id=picture_building_id)
        if len(picture_building_instance) != 1:
            return bad_request("PictureBuilding")
        picture_building_instance[0].delete()
        return delete_success()


class PicturesOfBuildingView(APIView):
    def get(self, request, building_id):
        """
        Get all pictures of a building with given id
        """

        # TODO: The existence of the building_id was checked in the original code of this function (before cleanup), but is this really necessary?
        #  I vote no
        #  Anyway, this will be made clear if we write tests (then it should be consistent in all routes)
        if not Building.objects.filter(id=building_id):
            return bad_request("Building")

        picture_building_instances = PictureBuilding.objects.filter(building_id=building_id)
        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return get_success(serializer)


class AllPictureBuildingsView(APIView):
    def get(self, request):
        """
        Get all pictureBuilding
        """
        picture_building_instances = PictureBuilding.objects.all()

        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return get_success(serializer)
