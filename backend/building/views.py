from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from authorisation.permissions import OwnerOfBuilding, IsAdmin, IsSuperStudent, ReadOnlyStudent, IsSyndic
from base.models import Building
from base.serializers import BuildingSerializer
from util.request_response_util import *

# TODO:  we don't actually have to work with 'syndic' key, we can also require 'syndic_id' as parameter in body
#  however, de automatic documentation might be a bit harder?
TRANSLATE = {"syndic": "syndic_id"}


class DefaultBuilding(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

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
    permission_classes = [IsAuthenticated,
                          IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerOfBuilding
                          ]

    def get(self, request, building_id):
        """
        Get info about building with given id
        """
        building_instance = Building.objects.filter(id=building_id)

        if not building_instance:
            return bad_request(object_name="Building")

        building_instance = building_instance[0]
        self.check_object_permissions(request, building_instance)
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

        self.check_object_permissions(request, building_instance)

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
        self.check_object_permissions(request, building_instance)
        data = request_to_dict(request.data)

        set_keys_of_instance(building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_instance):
            return r

        return patch_success(BuildingSerializer(building_instance))


class AllBuildingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def get(self, request):
        """
        Get all buildings
        """
        building_instances = Building.objects.all()

        serializer = BuildingSerializer(building_instances, many=True)
        return get_success(serializer)


class BuildingOwnerView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | OwnerOfBuilding]

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
