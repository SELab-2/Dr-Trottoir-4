from rest_framework import permissions
from rest_framework.views import APIView

from base.models import Building
from base.serializers import BuildingSerializer
from util.request_response_util import *


class DefaultBuilding(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Create a new building
        """
        data = request_to_dict(request.data)

        building_instance = Building()

        set_keys_of_instance(building_instance, data, {"syndic": "syndic_id"})

        if r := try_full_clean_and_save(building_instance):
            return r

        serializer = BuildingSerializer(building_instance)
        return post_success(serializer)


class BuildingIndividualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, building_id):
        """
        Get info about building with given id
        """
        building_instance = Building.objects.filter(id=building_id)

        if not building_instance:
            return bad_request(object_name="Building")

        building_instance = building_instance[0]
        serializer = BuildingSerializer(building_instance)
        return get_success(serializer)

    def delete(self, request, building_id):
        """
        Delete building with given id
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return bad_request(object_name="Building")
        building_instance = building_instance[0]

        building_instance.delete()
        return delete_success()

    def patch(self, request, building_id):
        """
        Edit building with given ID
        """
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return bad_request(object_name="Building")

        building_instance = building_instance[0]
        data = request_to_dict(request.data)

        set_keys_of_instance(building_instance, data, {"syndic": "syndic_id"})

        if r := try_full_clean_and_save(building_instance):
            return r

        return patch_success(BuildingSerializer(building_instance))


class AllBuildingsView(APIView):

    def get(self, request):
        """
        Get all buildings
        """
        building_instances = Building.objects.all()

        serializer = BuildingSerializer(building_instances, many=True)
        return get_success(serializer)


class BuildingOwnerView(APIView):

    def get(self, request, owner_id):
        """
        Get all buildings owned by syndic with given id
        """
        building_instance = Building.objects.filter(syndic=owner_id)

        if not building_instance:
            return bad_request_relation("building", "syndic")

        serializer = BuildingSerializer(building_instance, many=True)
        return get_success(serializer)
