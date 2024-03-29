from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.views import APIView

from base.models import Manual, Building
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
    def post(self, request: Request):
        """
        Create a new manual with data from post.
        You do not need to provide a version number. If none is given, the backend will provide one for you.
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

        if not Building.objects.filter(id=building_id):
            return not_found("Building")

        try:
            most_recent_only = get_boolean_param(request, "most-recent")
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        manual_instances = Manual.objects.filter(building_id=building_id)

        if most_recent_only:
            manual_instances = manual_instances.order_by("-version_number").first()

        serializer = ManualSerializer(manual_instances, many=not most_recent_only)
        return get_success(serializer)


class ManualsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = ManualSerializer

    def get(self, request):
        """
        Get all manuals
        """
        instances = Manual.objects.all()

        serializer = ManualSerializer(instances, many=True)
        return get_success(serializer)
