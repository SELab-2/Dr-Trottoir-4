from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import BuildingComment
from base.permissions import IsAdmin, IsSuperStudent, OwnerOfBuilding, ReadOnlyStudent, ReadOnlyOwnerOfBuilding
from base.serializers import BuildingCommentSerializer
from util.request_response_util import (
    post_docs,
    set_keys_of_instance,
    not_found,
    request_to_dict,
    try_full_clean_and_save,
    post_success,
    get_docs,
    get_success,
    delete_docs,
    delete_success,
    patch_docs,
    patch_success,
)

TRANSLATE = {"building": "building_id"}


class DefaultBuildingComment(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | OwnerOfBuilding]
    serializer_class = BuildingCommentSerializer

    @extend_schema(responses=post_docs(BuildingCommentSerializer))
    def post(self, request):
        """
        Create a new BuildingComment. If no date is set, the current date and time will be used.
        """
        data = request_to_dict(request.data)

        building_comment_instance = BuildingComment()

        set_keys_of_instance(building_comment_instance, data, TRANSLATE)

        if building_comment_instance.building is None:
            return not_found(_("Building (with id {id})".format(id=building_comment_instance.building_id)))

        self.check_object_permissions(request, building_comment_instance.building)

        if r := try_full_clean_and_save(building_comment_instance):
            return r

        return post_success(BuildingCommentSerializer(building_comment_instance))


class BuildingCommentIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyOwnerOfBuilding | ReadOnlyStudent]
    serializer_class = BuildingCommentSerializer

    @extend_schema(responses=get_docs(BuildingCommentSerializer))
    def get(self, request, building_comment_id):
        """
        Get an invividual BuildingComment with given id
        """
        building_comment_instances = BuildingComment.objects.filter(id=building_comment_id)

        if not building_comment_instances:
            return not_found("BuildingComment")

        building_comment_instance = building_comment_instances[0]

        self.check_object_permissions(request, building_comment_instance.building)
        return get_success(BuildingCommentSerializer(building_comment_instance))

    @extend_schema(responses=delete_docs())
    def delete(self, request, building_comment_id):
        """
        Delete a BuildingComment with given id
        """
        building_comment_instances = BuildingComment.objects.filter(id=building_comment_id)

        if not building_comment_instances:
            return not_found("BuildingComment")

        building_comment_instance = building_comment_instances[0]

        self.check_object_permissions(request, building_comment_instance.building)

        building_comment_instance.delete()
        return delete_success()

    @extend_schema(responses=patch_docs(BuildingCommentSerializer))
    def patch(self, request, building_comment_id):
        """
        Edit BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objects.filter(id=building_comment_id)

        if not building_comment_instance:
            return not_found("BuildingComment")

        building_comment_instance = building_comment_instance[0]
        self.check_object_permissions(request, building_comment_instance.building)

        data = request_to_dict(request.data)

        set_keys_of_instance(building_comment_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_comment_instance):
            return r

        return patch_success(BuildingCommentSerializer(building_comment_instance))


class BuildingCommentBuildingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | OwnerOfBuilding | ReadOnlyStudent]
    serializer_class = BuildingCommentSerializer

    @extend_schema(responses=get_docs(BuildingCommentSerializer))
    def get(self, request, building_id):
        """
        Get all BuildingComments of building with given building id
        """
        building_comment_instance = BuildingComment.objects.filter(building_id=building_id)

        serializer = BuildingCommentSerializer(building_comment_instance, many=True)
        return get_success(serializer)


class BuildingCommentAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = BuildingCommentSerializer

    def get(self, request):
        """
        Get all BuildingComments in database
        """
        building_comment_instances = BuildingComment.objects.all()

        serializer = BuildingCommentSerializer(building_comment_instances, many=True)
        return get_success(serializer)
