from django.core.exceptions import BadRequest
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from base.models import RemarkAtBuilding
from base.permissions import (
    IsSuperStudent,
    IsAdmin,
    IsStudent,
    OwnerAccount,
    ReadOnlyOwnerOfBuilding,
)
from base.serializers import RemarkAtBuildingSerializer
from util.request_response_util import (
    post_docs,
    request_to_dict,
    set_keys_of_instance,
    try_full_clean_and_save,
    not_found,
    get_success,
    delete_success,
    delete_docs,
    patch_success,
    patch_docs,
    get_docs,
    post_success, param_docs, get_most_recent_param_docs, get_boolean_param,
)

TRANSLATE = {
    "student_on_tour": "student_on_tour_id",
    "building": "building_id",
}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = RemarkAtBuildingSerializer

    @extend_schema(responses=post_docs(serializer_class))
    def post(self, request):
        """
        Create a new RemarkAtBuilding with data from post
        """
        data = request_to_dict(request.data)

        remark_at_building = RemarkAtBuilding()

        set_keys_of_instance(remark_at_building, data, TRANSLATE)

        if r := try_full_clean_and_save(remark_at_building):
            return r

        self.check_object_permissions(request, remark_at_building.student_on_tour.student)

        return post_success(self.serializer_class(remark_at_building))


class RemarkAtBuildingIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = RemarkAtBuildingSerializer

    @extend_schema(responses=get_success(serializer_class))
    def get(self, request, remark_at_building_id):
        """
        Get info about a remark at building with given id
        """
        remark_at_building_instance = RemarkAtBuilding.objects.filter(id=remark_at_building_id).first()

        if not remark_at_building_instance:
            return not_found(object_name="RemarkAtBuilding")

        self.check_object_permissions(request, remark_at_building_instance.student_on_tour.student)

        return get_success(self.serializer_class(remark_at_building_instance))

    @extend_schema(responses=delete_docs())
    def delete(self, request, remark_at_building_id):
        """
        Delete remark at building with given id
        """
        remark_at_building_instance = RemarkAtBuilding.objects.filter(id=remark_at_building_id).first()
        if not remark_at_building_instance:
            return not_found(object_name="RemarkAtBuilding")

        self.check_object_permissions(request, remark_at_building_instance.student_on_tour.student)

        remark_at_building_instance.delete()
        return delete_success()

    @extend_schema(responses=patch_docs(serializer_class))
    def patch(self, request, remark_at_building_id):
        """
        Edit building with given ID
        """
        remark_at_building_instance = RemarkAtBuilding.objects.filter(id=remark_at_building_id).first()
        if not remark_at_building_instance:
            return not_found(object_name="RemarkAtBuilding")

        self.check_object_permissions(request, remark_at_building_instance.student_on_tour.student)

        data = request_to_dict(request.data)

        set_keys_of_instance(remark_at_building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(remark_at_building_instance):
            return r

        return patch_success(self.serializer_class(remark_at_building_instance))


class AllRemarkAtBuilding(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = RemarkAtBuildingSerializer

    def get(self, request):
        """
        Get all remarks for each building
        """
        remark_at_building_instances = RemarkAtBuilding.objects.all()
        return get_success(self.serializer_class(remark_at_building_instances, many=True))


class RemarksAtBuildingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyOwnerOfBuilding]
    serializer_class = RemarkAtBuildingSerializer

    @extend_schema(responses=get_docs(serializer_class),
                   parameters=param_docs(get_most_recent_param_docs("RemarksAtBuilding")))
    def get(self, request, building_id):
        """
        Get all remarks on a specific building
        """
        remark_at_building_instances = RemarkAtBuilding.objects.filter(building_id=building_id)

        try:
            most_recent_only = get_boolean_param(request, "most-recent")
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if most_recent_only:
            instances = remark_at_building_instances.order_by("-timestamp").first()

            # Now we have the most recent one, but there are more remarks on that same day
            most_recent_day = str(instances.timestamp.date())

            remark_at_building_instances = remark_at_building_instances.filter(timestamp__gte=most_recent_day)

        return get_success(self.serializer_class(remark_at_building_instances, many=True))
