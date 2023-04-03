from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import RemarkAtBuilding
from base.permissions import IsSuperStudent, IsAdmin, IsStudent, OwnerAccount
from base.serializers import RemarkAtBuildingSerializer
from util.request_response_util import post_docs, request_to_dict, set_keys_of_instance, try_full_clean_and_save

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
        data = request_to_dict(request)

        remark_at_building = RemarkAtBuilding()

        set_keys_of_instance(remark_at_building, data, TRANSLATE)

        if r := try_full_clean_and_save(remark_at_building):
            return r

        self.check_object_permissions(request, remark_at_building.student_on_tour.student)

        return post_docs(self.serializer_class(remark_at_building))
