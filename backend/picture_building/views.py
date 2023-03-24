from django.db.models import QuerySet
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.permissions import IsAdmin, IsSuperStudent, IsStudent, ReadOnlyOwnerOfBuilding
from base.models import PictureBuilding, Building
from base.serializers import PictureBuildingSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema
from datetime import datetime

DESCRIPTION = 'Optionally, you can filter by date, by using the keys "from" and/or "to". When filtering, "from" and "to" are included in the result. The keys must be in format "%Y-%m-%d %H:%M:%S"  or "%Y-%m-%d".'

TYPES_DESCRIPTION = (
    "The possible types are: AA, BI, VE and OP. These stand for aankomst, binnen, vertrek and opmerkingen respectively."
)

TRANSLATE = {"building": "building_id"}


def get_pictures_in_range(instances, from_date: str = None, to_date: str = None) -> Response | QuerySet:
    from_d = None
    to_d = None
    if from_date:
        try:
            from_d = datetime.strptime(from_date, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                from_d = datetime.strptime(from_date, "%Y-%m-%d")
            except ValueError:
                return Response(status=status.HTTP_400_BAD_REQUEST, data="Invalid date format")
    if to_date:
        try:
            to_d = datetime.strptime(to_date, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                to_d = datetime.strptime(to_date, "%Y-%m-%d")
            except ValueError:
                return Response(status=status.HTTP_400_BAD_REQUEST, data="Invalid date format")

    if from_d:
        instances = instances.filter(timestamp__gte=from_d)
    if to_date:
        instances = instances.filter(timestamp__lte=to_d)

    return instances


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsStudent]
    serializer_class = PictureBuildingSerializer

    @extend_schema(
        responses={201: PictureBuildingSerializer, 400: None},
        description="Create a new PictureBuilding." + TYPES_DESCRIPTION,
    )
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

    @extend_schema(
        responses={200: PictureBuildingSerializer, 400: None},
        description="Get PictureBuilding with given id." + TYPES_DESCRIPTION,
    )
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

    @extend_schema(
        responses={200: PictureBuildingSerializer, 400: None},
        description="Edit info about PictureBuilding with given id." + TYPES_DESCRIPTION,
    )
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

    @extend_schema(responses={204: None, 400: None})
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

    @extend_schema(description=DESCRIPTION + TYPES_DESCRIPTION, responses={200: PictureBuildingSerializer, 400: None})
    def get(self, request, building_id):
        """
        Get all pictures of a building with given id
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return bad_request(building_instance)
        building_instance = building_instance[0]

        self.check_object_permissions(request, building_instance)

        picture_building_instances = PictureBuilding.objects.filter(building=building_id)
        res = get_pictures_in_range(
            picture_building_instances, from_date=request.data.get("from"), to_date=request.data.get("to")
        )

        if isinstance(res, Response):
            return res

        serializer = PictureBuildingSerializer(res, many=True)
        return get_success(serializer)


class AllPictureBuildingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = PictureBuildingSerializer

    openapi_schema = {
        "operationId": "picture_building_all_retrieve",
        "description": DESCRIPTION + TYPES_DESCRIPTION,
        "tags": ["picture-building"],
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "from": {"type": "string", "format": "date-time"},
                            "to": {"type": "string", "format": "date-time"},
                        },
                        "required": ["from", "to"],
                    }
                }
            }
        },
        "security": [{"jwtHeaderAuth": []}, {"jwtCookieAuth": []}],
        "responses": {
            "200": {
                "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PictureBuilding"}}},
                "description": "",
            }
        },
    }

    @extend_schema(operation=openapi_schema)
    def get(self, request):
        """
        Get all pictureBuilding
        """
        picture_building_instances = PictureBuilding.objects.all()

        data = request_to_dict(request.data)

        res = get_pictures_in_range(picture_building_instances, from_date=data.get("from"), to_date=data.get("to"))

        if isinstance(res, Response):
            return res

        serializer = PictureBuildingSerializer(res, many=True)
        return get_success(serializer)
