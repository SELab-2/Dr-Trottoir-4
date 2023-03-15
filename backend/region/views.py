from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from authorisation.permissions import IsAdmin, ReadOnly, IsSuperStudent, IsStudent
from base.models import Region
from base.serializers import RegionSerializer
from util.request_response_util import *


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """
        Create a new region
        """
        data = request.data

        region_instance = Region()

        set_keys_of_instance(region_instance, data)

        if r := try_full_clean_and_save(region_instance):
            return r

        serializer = RegionSerializer(region_instance)
        return post_success(serializer)


class RegionIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | ReadOnly]

    def get(self, request, region_id):
        """
        Get info about a Region with given id
        """
        region_instance = Region.objects.filter(id=region_id)

        if len(region_instance) != 1:
            return bad_request(object_name="Region")

        serializer = RegionSerializer(region_instance[0])
        return get_success(serializer)

    def patch(self, request, region_id):
        """
        Edit Region with given id
        """
        region_instances = Region.objects.filter(id=region_id)

        if len(region_instances) != 1:
            return bad_request(object_name="Region")

        region_instance = region_instances[0]

        data = request_to_dict(request.data)

        set_keys_of_instance(region_instance, data)

        if r := try_full_clean_and_save(region_instance):
            return r

        return patch_success(RegionSerializer(region_instance))

    def delete(self, request, region_id):
        """
        delete a region with given id
        """
        region_instances = Region.objects.filter(id=region_id)

        if len(region_instances) != 1:
            return bad_request(object_name="Region")

        region_instances[0].delete()
        return delete_success()


class AllRegionsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsStudent]

    def get(self, request):
        """
        Get all regions
        """
        region_instances = Region.objects.all()
        serializer = RegionSerializer(region_instances, many=True)
        return get_success(serializer)
