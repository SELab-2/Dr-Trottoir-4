from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import PictureOfRemark, StudentOnTour
from base.permissions import IsAdmin, IsSuperStudent, IsStudent, OwnerAccount
from base.serializers import PictureOfRemarkSerializer
from util.request_response_util import post_docs, request_to_dict, set_keys_of_instance, try_full_clean_and_save, \
    get_success, not_found

TRANSLATE = {"remark_at_building": "remark_at_building_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = PictureOfRemarkSerializer

    @extend_schema(responses=post_docs(serializer_class))
    def post(self, request):
        """
        Create a new PictureOfRemark with data from post
        """
        data = request_to_dict(request)

        picture_of_remark_instance = PictureOfRemark()

        set_keys_of_instance(picture_of_remark_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(picture_of_remark_instance):
            return r

        self.check_object_permissions(request, picture_of_remark_instance.remark_at_building.student_on_tour.student)

        return post_docs(self.serializer_class(picture_of_remark_instance))


class PictureOfRemarkIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = PictureOfRemarkSerializer

    @extend_schema(responses=get_success(serializer_class))
    def get(self, request, remark_at_building_id):
        """
        Get info about a remark at building with a given id
        """
        picture_of_remark = PictureOfRemark.objects.filter(
            id=remark_at_building_id).first()

        if not picture_of_remark:
            return not_found(object_name="PictureOfRemark")

        self.check_object_permissions(request, picture_of_remark.student_on_tour.student)

        return get_success(self.serializer_class(picture_of_remark))


class AllPictureOfRemark(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = PictureOfRemarkSerializer

    def get(self, request):
        """
        Get all pictures from each remark
        """
        picture_of_remark_instances = PictureOfRemark.objects.all()
        return get_success(self.serializer_class(picture_of_remark_instances, many=True))
