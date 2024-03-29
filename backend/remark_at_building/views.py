from django.core.exceptions import BadRequest
from django.utils.translation import gettext_lazy as _
from drf_spectacular.types import OpenApiTypes
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
    param_docs,
    get_most_recent_param_docs,
    get_boolean_param,
    post_success,
    bad_request,
    get_id_param,
    get_arbitrary_param,
    bad_request_custom_error_message,
    get_date_param,
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
        Edit remark at building with given ID
        """
        remark_at_building_instance = RemarkAtBuilding.objects.filter(id=remark_at_building_id).first()
        if not remark_at_building_instance:
            return not_found(object_name="RemarkAtBuilding")

        self.check_object_permissions(request, remark_at_building_instance.student_on_tour.student)

        data = request_to_dict(request.data)

        # check if patch only edit's the text:
        forbidden_keys = ["timestamp", "building", "student_on_tour", "type", "id"]
        if any(k in forbidden_keys for k in data.keys()):
            return Response(
                {"message": _("You can only edit the 'remark' text on a remark at building")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        set_keys_of_instance(remark_at_building_instance, data, TRANSLATE)

        remark_at_building_instance.save(update_fields=["remark"])

        return patch_success(self.serializer_class(remark_at_building_instance))


class AllRemarkAtBuilding(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | IsStudent]
    serializer_class = RemarkAtBuildingSerializer

    @extend_schema(
        responses={200: serializer_class, 400: None},
        parameters=param_docs(
            {
                "student-on-tour": ("The StudentOnTour id", False, OpenApiTypes.INT),
                "building": ("The Building id", False, OpenApiTypes.INT),
                "type": ("The type of the garbage", False, OpenApiTypes.STR),
            }
        ),
    )
    def get(self, request):
        """
        Get all remarks for each building. A students only see their own remarks.
        """

        # We support the params student-on-tour, building, and type
        try:
            student_on_tour_id = get_id_param(request, "student-on-tour", required=False)
            building_id = get_id_param(request, "building", required=False)
            garbage_type = get_arbitrary_param(request, "type", allowed_keys={"AA", "BI", "VE", "OP"}, required=False)
        except BadRequest as e:
            return bad_request_custom_error_message(str(e))

        remark_at_building_instances = RemarkAtBuilding.objects.all()

        # Query params are specified, so filter the queryset
        if student_on_tour_id:
            remark_at_building_instances = remark_at_building_instances.filter(student_on_tour_id=student_on_tour_id)
        if building_id:
            remark_at_building_instances = remark_at_building_instances.filter(building_id=building_id)
        if garbage_type:
            remark_at_building_instances = remark_at_building_instances.filter(type=garbage_type)

        # A student should only be able to see their own remarks
        if request.user.role.name.lower() == "student":
            remark_at_building_instances = remark_at_building_instances.filter(student_on_tour__student=request.user.id)

        return get_success(self.serializer_class(remark_at_building_instances, many=True))


class RemarksAtBuildingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyOwnerOfBuilding]
    serializer_class = RemarkAtBuildingSerializer

    @extend_schema(
        responses=get_docs(serializer_class),
        parameters=param_docs(
            get_most_recent_param_docs("RemarksAtBuilding")
            | {
                "date": (
                    "The date to get remarks for. You cannot use both the most-recent query parameter and the date parameter.",
                    False,
                    OpenApiTypes.DATE,
                )
            }
        ),
    )
    def get(self, request, building_id):
        """
        Get all remarks on a specific building
        """
        remark_at_building_instances = RemarkAtBuilding.objects.filter(building_id=building_id)

        try:
            most_recent_only = get_boolean_param(request, "most-recent")
            date = get_date_param(request, "date")
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if most_recent_only and date:
            return bad_request_custom_error_message(_("Cannot use both most-recent and date for RemarkAtBuilding"))

        if most_recent_only:
            most_recent_remark = remark_at_building_instances.order_by("-timestamp").first()
            if most_recent_remark:
                # Now we have the most recent one, now get all remarks from that day
                most_recent_day = most_recent_remark.timestamp.date()

                remark_at_building_instances = remark_at_building_instances.filter(timestamp__gte=most_recent_day)

        elif date:
            remark_at_building_instances = remark_at_building_instances.filter(timestamp__date=date)

        return get_success(self.serializer_class(remark_at_building_instances, many=True))
