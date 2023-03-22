from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.permissions import (
    IsAdmin,
    IsSuperStudent,
    IsSyndic,
    OwnerOfBuilding,
    ReadOnlyStudent,
    ReadOnlyManualFromSyndic,
)
from base.models import Manual, Building
from base.serializers import ManualSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema

TRANSLATE = {"building": "building_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsSyndic]
    serializer_class = ManualSerializer

    @extend_schema(responses={201: ManualSerializer, 400: None})
    def post(self, request):
        """
        Create a new manual with data from post
        """
        data = request_to_dict(request.data)
        manual_instance = Manual()

        set_keys_of_instance(manual_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(manual_instance):
            return r

        return post_success(ManualSerializer(manual_instance))


class ManualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | ReadOnlyManualFromSyndic]
    serializer_class = ManualSerializer

    @extend_schema(responses={200: ManualSerializer, 400: None})
    def get(self, request, manual_id):
        """
        Get info about a manual with given id
        """
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return bad_request("Manual")
        manual_instance = manual_instances[0]

        self.check_object_permissions(manual_instance)

        serializer = ManualSerializer(manual_instances)
        return get_success(serializer)

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, manual_id):
        """
        Delete manual with given id
        """
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return bad_request("Manual")
        manual_instances[0].delete()
        return delete_success()

    @extend_schema(responses={200: ManualSerializer, 400: None})
    def patch(self, request, manual_id):
        """
        Edit info about a manual with given id
        """
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return bad_request("Manual")
        manual_instance = manual_instances[0]
        data = request_to_dict(request.data)

        set_keys_of_instance(manual_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(manual_instance):
            return r

        return patch_success(ManualSerializer(manual_instance))


class ManualBuildingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerOfBuilding]
    serializer_class = ManualSerializer

    @extend_schema(responses={200: ManualSerializer, 400: None})
    def get(self, request, building_id):
        """
        Get all manuals of a building with given id
        """
        if not Building.objects.filter(id=building_id):
            return bad_request("Building")

        manual_instances = Manual.objects.filter(building_id=building_id)
        serializer = ManualSerializer(manual_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ManualsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = ManualSerializer

    def get(self, request):
        """
        Get all manuals
        """
        instances = Manual.objects.all()

        serializer = ManualSerializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
