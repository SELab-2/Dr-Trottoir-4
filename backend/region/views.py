from rest_framework import permissions
from rest_framework.views import APIView

from base.models import Region
from base.serializers import RegionSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema


class Default(APIView):
    serializer_class = RegionSerializer

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={201: RegionSerializer}
    )
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
    serializer_class = RegionSerializer

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: RegionSerializer,
                   400: None}
    )
    def get(self, request, region_id):
        """
        Get info about a Region with given id
        """
        region_instance = Region.objects.filter(id=region_id)

        if len(region_instance) != 1:
            return bad_request(object_name="Region")

        serializer = RegionSerializer(region_instance[0])
        return get_success(serializer)


    @extend_schema(
        responses={204: None,
                   400: None}
    )
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


    @extend_schema(
        responses={204: None,
                   400: None}
    )
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
    serializer_class = RegionSerializer

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get all regions
        """
        region_instances = Region.objects.all()
        serializer = RegionSerializer(region_instances, many=True)
        return get_success(serializer)
