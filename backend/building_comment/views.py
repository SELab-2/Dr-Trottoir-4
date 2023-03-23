from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.permissions import IsAdmin, IsSuperStudent, OwnerOfBuilding, ReadOnlyStudent
from base.models import BuildingComment
from base.serializers import BuildingCommentSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema

TRANSLATE = {"building": "building_id"}


class DefaultBuildingComment(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | OwnerOfBuilding]
    serializer_class = BuildingCommentSerializer

    @extend_schema(responses=get_patch_docs(BuildingCommentSerializer))
    def post(self, request):
        """
        Create a new BuildingComment
        """
        data = request_to_dict(request.data)

        building_comment_instance = BuildingComment()

        self.check_object_permissions(request, building_comment_instance.building)

        set_keys_of_instance(building_comment_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_comment_instance):
            return r

        return post_success(BuildingCommentSerializer(building_comment_instance))


class BuildingCommentIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | OwnerOfBuilding | ReadOnlyStudent]
    serializer_class = BuildingCommentSerializer

    @extend_schema(responses=get_patch_docs(BuildingCommentSerializer))
    def get(self, request, building_comment_id):
        """
        Get an invividual BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objects.filter(id=building_comment_id)

        self.check_object_permissions(request, building_comment_instance.building)

        if not building_comment_instance:
            return bad_request("BuildingComment")

        return get_success(BuildingCommentSerializer(building_comment_instance[0]))

    @extend_schema(responses=delete_docs(BuildingCommentSerializer))
    def delete(self, request, building_comment_id):
        """
        Delete a BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objects.filter(id=building_comment_id)

        self.check_object_permissions(request, building_comment_instance.building)

        if not building_comment_instance:
            return bad_request("BuildingComment")

        building_comment_instance[0].delete()
        return delete_success()

    @extend_schema(responses=get_patch_docs(BuildingCommentSerializer))
    def patch(self, request, building_comment_id):
        """
        Edit BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objects.filter(id=building_comment_id)

        if not building_comment_instance:
            return bad_request("BuildingComment")

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

    @extend_schema(responses=get_patch_docs(BuildingCommentSerializer))
    def get(self, request, building_id):
        """
        Get all BuildingComments of building with given building id
        """
        building_comment_instance = BuildingComment.objects.filter(building_id=building_id)

        if not building_comment_instance:
            return bad_request_relation("BuildingComment", "building")

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
