from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import Manual
from base.permissions import (
    IsAdmin,
    IsSuperStudent,
    IsSyndic,
    OwnerOfBuilding,
    ReadOnlyStudent,
    ReadOnlyManualFromSyndic,
)
from base.serializers import ManualSerializer
from util.request_response_util import *

TRANSLATE = {"building": "building_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsSyndic]
    serializer_class = ManualSerializer

    @extend_schema(responses=post_docs(ManualSerializer))
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

    @extend_schema(responses=get_docs(ManualSerializer))
    def get(self, request, manual_id):
        """
        Get info about a manual with given id
        """
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return not_found("Manual")
        manual_instance = manual_instances[0]

        self.check_object_permissions(request, manual_instance)

        serializer = ManualSerializer(manual_instance)
        return get_success(serializer)

    @extend_schema(responses=delete_docs())
    def delete(self, request, manual_id):
        """
        Delete manual with given id
        """
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return not_found("Manual")
        manual_instances[0].delete()
        return delete_success()

    @extend_schema(responses=patch_docs(ManualSerializer))
    def patch(self, request, manual_id):
        """
        Edit info about a manual with given id
        """
        manual_instances = Manual.objects.filter(id=manual_id)
        if len(manual_instances) != 1:
            return not_found("Manual")
        manual_instance = manual_instances[0]
        data = request_to_dict(request.data)

        set_keys_of_instance(manual_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(manual_instance):
            return r

        return patch_success(ManualSerializer(manual_instance))


class ManualBuildingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerOfBuilding]
    serializer_class = ManualSerializer

    @extend_schema(
        responses=get_docs(ManualSerializer),
        parameters=param_docs(get_most_recent_param_docs("manual")),
    )
    def get(self, request, building_id):
        """
        Get all manuals of a building with given id
        """
        manual_instances = Manual.objects.filter(building_id=building_id)
        return get_maybe_most_recent_param(request, manual_instances, self.serializer_class, "-version_number")


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
