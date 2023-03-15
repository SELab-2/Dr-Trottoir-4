from rest_framework.views import APIView

from base.models import BuildingComment
from base.serializers import BuildingCommentSerializer
from util.request_response_util import *

TRANSLATE = {"building": "building_id"}


class DefaultBuildingComment(APIView):

    def post(self, request):
        """
        Create a new BuildingComment
        """
        data = request_to_dict(request.data)

        building_comment_instance = BuildingComment()

        set_keys_of_instance(building_comment_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_comment_instance):
            return r

        return post_success(BuildingCommentSerializer(building_comment_instance))


class BuildingCommentIndividualView(APIView):

    def get(self, request, building_comment_id):
        """
        Get an invividual BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objects.filter(id=building_comment_id)

        if not building_comment_instance:
            return bad_request("BuildingComment")

        return get_success(BuildingCommentSerializer(building_comment_instance[0]))

    def delete(self, request, building_comment_id):
        """
        Delete a BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objectts.filter(id=building_comment_id)

        if not building_comment_instance:
            return bad_request("BuildingComment")

        building_comment_instance[0].delete()
        return delete_success()

    def patch(self, request, building_comment_id):
        """
        Edit BuildingComment with given id
        """
        building_comment_instance = BuildingComment.objects.filter(id=building_comment_id)

        if not building_comment_instance:
            return bad_request("BuildingComment")

        building_comment_instance = building_comment_instance[0]
        data = request_to_dict(request.data)

        set_keys_of_instance(building_comment_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_comment_instance):
            return r

        return patch_success(BuildingCommentSerializer(building_comment_instance))


class BuildingCommentBuildingView(APIView):

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

    def get(self, request):
        """
        Get all BuildingComments in database
        """
        building_comment_instances = BuildingComment.objects.all()

        serializer = BuildingCommentSerializer(building_comment_instances, many=True)
        return get_success(serializer)
