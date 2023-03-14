from rest_framework import permissions
from rest_framework.views import APIView

from base.models import Building
from base.serializers import BuildingSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema


class DefaultBuilding(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BuildingSerializer

    @extend_schema(
        responses={201: BuildingSerializer}
    )
    def post(self, request):
        """
        Create a new building
        """
        data = request_to_dict(request.data)

        if "syndic" in data.keys():
            data["syndic_id"] = data["syndic"]

        building_instance = Building()

        for key in data.keys():
            if key in vars(building_instance):
                setattr(building_instance, key, data[key])

        if r := try_full_clean_and_save(building_instance):
            return r

        serializer = BuildingSerializer(building_instance)
        return post_succes(serializer)


class BuildingIndividualView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BuildingSerializer

    @extend_schema(
        responses={200: BuildingSerializer,
                   400: None}
    )
    def get(self, request, building_id):
        """
        Get info about building with given id
        """
        building_instance = Building.objects.filter(id=building_id)

        if not building_instance:
            return bad_request(object_name="Building")

        building_instance = building_instance[0]
        serializer = BuildingSerializer(building_instance)
        return get_succes(serializer)

    @extend_schema(
        responses={204: None,
                   400: None}
    )
    def delete(self, request, building_id):
        """
        Delete building with given id
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return bad_request(object_name="building")
        building_instance = building_instance[0]

        building_instance.delete()
        return delete_succes()

    @extend_schema(
        responses={204: None,
                   400: None}
    )
    def patch(self, request, building_id):
        """
        Edit building with given ID
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return bad_request(object_name="building")

        building_instance = building_instance[0]
        data = request_to_dict(request.data)

        if "syndic" in data.keys():
            data["syndic_id"] = data["syndic"]

        for key in data.keys():
            if key in vars(building_instance):
                setattr(building_instance, key, data[key])

        if r := try_full_clean_and_save(building_instance):
            return r

        return patch_succes(BuildingSerializer(building_instance))


class AllBuildingsView(APIView):
    serializer_class = BuildingSerializer

    def get(self, request):
        """
        Get all buildings
        """
        building_instances = Building.objects.all()

        serializer = BuildingSerializer(building_instances, many=True)
        return get_succes(serializer)


class BuildingOwnerView(APIView):
    serializer_class = BuildingSerializer

    @extend_schema(
        responses={200: BuildingSerializer,
                   400: None}
    )
    def get(self, request, owner_id):
        """
        Get all buildings owned by syndic with given id
        """
        building_instance = Building.objects.filter(syndic=owner_id)

        if not building_instance:
            return bad_request_relation("building", "syndic")

        serializer = BuildingSerializer(building_instance, many=True)
        return get_succes(serializer)
