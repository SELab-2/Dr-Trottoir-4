from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
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
    post_success,
    bad_request,
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

        if remark_at_building.student_on_tour is None:
            return bad_request("RemarkAtBuilding")

        self.check_object_permissions(request, remark_at_building.student_on_tour.student)

        if r := try_full_clean_and_save(remark_at_building):
            return r
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

    @extend_schema(responses=get_docs(serializer_class))
    def get(self, request, building_id):
        """
        Get all remarks on a specific building
        """
        remark_at_building_instances = RemarkAtBuilding.objects.filter(building_id=building_id)
        if not remark_at_building_instances:
            return not_found("RemarkAtBuilding")

        for r in remark_at_building_instances:
            self.check_object_permissions(request, r.building)

        return get_success(self.serializer_class(remark_at_building_instances, many=True))
