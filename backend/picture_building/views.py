from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.permissions import IsAdmin, IsSuperStudent, IsStudent, ReadOnlyOwnerOfBuilding
from base.models import PictureBuilding, Building
from base.serializers import PictureBuildingSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema

TRANSLATE = {"building": "building_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsStudent]
    serializer_class = PictureBuildingSerializer

    @extend_schema(responses=post_docs(PictureBuildingSerializer))
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
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsStudent | ReadOnlyOwnerOfBuilding]
    serializer_class = PictureBuildingSerializer

    @extend_schema(responses=get_patch_docs(PictureBuildingSerializer))
    def get(self, request, picture_building_id):
        """
        Get PictureBuilding with given id
        """
        picture_building_instance = PictureBuilding.objects.filter(id=picture_building_id)

        if len(picture_building_instance) != 1:
            return bad_request("PictureBuilding")
        picture_building_instance = picture_building_instance[0]

        self.check_object_permissions(request, picture_building_instance.building)

        serializer = PictureBuildingSerializer(picture_building_instance)
        return get_success(serializer)

    @extend_schema(responses=get_patch_docs(PictureBuildingSerializer))
    def patch(self, request, picture_building_id):
        """
        Edit info about PictureBuilding with given id
        """
        picture_building_instance = PictureBuilding.objects.filter(id=picture_building_id)
        if not picture_building_instance:
            return bad_request("PictureBuilding")

        picture_building_instance = picture_building_instance[0]
        self.check_object_permissions(request, picture_building_instance)

        data = request_to_dict(request.data)

        set_keys_of_instance(picture_building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(picture_building_instance):
            return r

        return patch_success(PictureBuildingSerializer(picture_building_instance))

    @extend_schema(responses=delete_docs(PictureBuildingSerializer))
    def delete(self, request, picture_building_id):
        """
        delete a pictureBuilding from the database
        """
        picture_building_instance = PictureBuilding.objects.filter(id=picture_building_id)
        if len(picture_building_instance) != 1:
            return bad_request("PictureBuilding")
        picture_building_instance = picture_building_instance[0]

        self.check_object_permissions(request, picture_building_instance)

        picture_building_instance.delete()
        return delete_success()


class PicturesOfBuildingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsStudent | ReadOnlyOwnerOfBuilding]

    serializer_class = PictureBuildingSerializer

    def get(self, request, building_id):
        """
        Get all pictures of a building with given id
        """
        building_instance = Building.objects.filter(building_id=building_id)
        if not building_instance:
            return bad_request(building_instance)
        building_instance = building_instance[0]

        self.check_object_permissions(request, building_instance)

        picture_building_instances = PictureBuilding.objects.filter(building_id=building_id)
        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return get_success(serializer)


class AllPictureBuildingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = PictureBuildingSerializer

    def get(self, request):
        """
        Get all pictureBuilding
        """
        picture_building_instances = PictureBuilding.objects.all()

        serializer = PictureBuildingSerializer(picture_building_instances, many=True)
        return get_success(serializer)
