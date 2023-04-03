from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import Building
from base.permissions import (
    ReadOnlyOwnerOfBuilding,
    IsAdmin,
    IsSuperStudent,
    ReadOnlyStudent,
    OwnerOfBuilding,
    OwnerWithLimitedPatch,
)
from base.serializers import BuildingSerializer
from util.request_response_util import *

TRANSLATE = {"syndic": "syndic_id"}


class DefaultBuilding(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = BuildingSerializer

    @extend_schema(responses=post_docs(BuildingSerializer))
    def post(self, request):
        """
        Create a new building
        """
        data = request_to_dict(request.data)

        building_instance = Building()

        set_keys_of_instance(building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_instance):
            return r

        serializer = BuildingSerializer(building_instance)
        return post_success(serializer)


class BuildingIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerWithLimitedPatch]
    serializer_class = BuildingSerializer

    @extend_schema(responses=get_docs(BuildingSerializer))
    def get(self, request, building_id):
        """
        Get info about building with given id
        """
        building_instance = Building.objects.filter(id=building_id)

        if not building_instance:
            return not_found(object_name="Building")

        building_instance = building_instance[0]
        self.check_object_permissions(request, building_instance)
        serializer = BuildingSerializer(building_instance)
        return get_success(serializer)

    @extend_schema(responses=delete_docs())
    def delete(self, request, building_id):
        """
        Delete building with given id
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return not_found(object_name="Building")
        building_instance = building_instance[0]

        self.check_object_permissions(request, building_instance)

        building_instance.delete()
        return delete_success()

    @extend_schema(responses=patch_docs(BuildingSerializer))
    def patch(self, request, building_id):
        """
        Edit building with given ID
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return not_found(object_name="Building")

        building_instance = building_instance[0]
        self.check_object_permissions(request, building_instance)
        data = request_to_dict(request.data)

        set_keys_of_instance(building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_instance):
            return r

        return patch_success(BuildingSerializer(building_instance))


# The building url you can access without account
class BuildingPublicView(APIView):
    serializer_class = BuildingSerializer

    @extend_schema(responses=get_docs(BuildingSerializer))
    def get(self, request, building_public_id):
        """
        Get building with the public id
        """
        building_instance = Building.objects.filter(public_id=building_public_id)

        if not building_instance:
            return not_found("Building")

        building_instance = building_instance[0]

        return get_success(BuildingSerializer(building_instance))


class BuildingNewPublicId(APIView):
    serializer_class = BuildingSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | OwnerOfBuilding]

    @extend_schema(
        description="Generate a new unique uuid as public id for the building.",
        responses=post_docs(BuildingSerializer),
    )
    def post(self, request, building_id):
        """
        Generate a new public_id for the building with given id
        """
        building_instance = Building.objects.filter(id=building_id)

        if not building_instance:
            return not_found("Building")

        building_instance = building_instance[0]

        self.check_object_permissions(request, building_instance)

        building_instance.public_id = get_unique_uuid()

        if r := try_full_clean_and_save(building_instance):
            return r

        return post_success(BuildingSerializer(building_instance))


class AllBuildingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = BuildingSerializer

    def get(self, request):
        """
        Get all buildings
        """
        building_instances = Building.objects.all()

        serializer = BuildingSerializer(building_instances, many=True)
        return get_success(serializer)


class BuildingOwnerView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyOwnerOfBuilding]
    serializer_class = BuildingSerializer

    @extend_schema(responses=get_docs(BuildingSerializer))
    def get(self, request, owner_id):
        """
        Get all buildings owned by syndic with given id
        """
        building_instance = Building.objects.filter(syndic=owner_id)

        for b in building_instance:
            self.check_object_permissions(request, b)

        if not building_instance:
            return bad_request_relation("building", "syndic")

        serializer = BuildingSerializer(building_instance, many=True)
        return get_success(serializer)
