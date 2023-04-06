from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import PictureOfRemark
from base.permissions import IsAdmin, IsSuperStudent, IsStudent, OwnerAccount
from base.serializers import PictureOfRemarkSerializer
from util.request_response_util import (
    post_docs,
    request_to_dict,
    set_keys_of_instance,
    try_full_clean_and_save,
    get_success,
    not_found,
    delete_docs,
    delete_success,
    patch_docs,
    patch_success,
    get_docs,
    post_success,
)

TRANSLATE = {"remark_at_building": "remark_at_building_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = PictureOfRemarkSerializer

    @extend_schema(responses=post_docs(serializer_class))
    def post(self, request):
        """
        Create a new PictureOfRemark with data from post
        """
        data = request_to_dict(request.data)

        picture_of_remark_instance = PictureOfRemark()

        set_keys_of_instance(picture_of_remark_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(picture_of_remark_instance):
            return r

        self.check_object_permissions(request, picture_of_remark_instance.remark_at_building.student_on_tour.student)

        return post_success(self.serializer_class(picture_of_remark_instance))


class PictureOfRemarkIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = PictureOfRemarkSerializer

    @extend_schema(responses=get_success(serializer_class))
    def get(self, request, remark_at_building_id):
        """
        Get info about a remark at building with a given id
        """
        picture_of_remark = PictureOfRemark.objects.filter(id=remark_at_building_id).first()

        if not picture_of_remark:
            return not_found(object_name="PictureOfRemark")

        self.check_object_permissions(request, picture_of_remark.student_on_tour.student)

        return get_success(self.serializer_class(picture_of_remark))

    @extend_schema(responses=delete_docs())
    def delete(self, request, picture_of_remark_id):
        """
        Delete remark at building with given id
        """
        picture_of_remark_instance = PictureOfRemark.objects.filter(id=picture_of_remark_id).first()
        if not picture_of_remark_instance:
            return not_found(object_name="RemarkAtBuilding")

        self.check_object_permissions(request, picture_of_remark_instance.student_on_tour.student)

        picture_of_remark_instance.delete()
        return delete_success()

    @extend_schema(responses=patch_docs(serializer_class))
    def patch(self, request, picture_of_remark_id):
        """
        Edit building with given ID
        """
        picture_of_remark_instance = PictureOfRemark.objects.filter(id=picture_of_remark_id).first()
        if not picture_of_remark_instance:
            return not_found(object_name="RemarkAtBuilding")

        self.check_object_permissions(request, picture_of_remark_instance.student_on_tour.student)

        data = request_to_dict(request.data)

        set_keys_of_instance(picture_of_remark_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(picture_of_remark_instance):
            return r

        return patch_success(self.serializer_class(picture_of_remark_instance))


class AllPictureOfRemark(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = PictureOfRemarkSerializer

    def get(self, request):
        """
        Get all pictures from each remark
        """
        picture_of_remark_instances = PictureOfRemark.objects.all()
        return get_success(self.serializer_class(picture_of_remark_instances, many=True))


class PicturesOfRemarkView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = PictureOfRemarkSerializer

    @extend_schema(responses=get_docs(serializer_class))
    def get(self, request, remark_id):
        """
        Get all pictures on a specific remark
        """
        pic_of_remark_instances = PictureOfRemark.objects.filter(remark_id=remark_id)
        if not pic_of_remark_instances:
            return not_found("PictureOfRemark")

        for r in pic_of_remark_instances:
            self.check_object_permissions(request, r.remark_at_building.student_on_tour.student)

        return get_success(self.serializer_class(pic_of_remark_instances, many=True))
