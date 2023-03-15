from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from authorisation.permissions import IsSuperStudent, IsAdmin, ReadOnlyStudent, OwnerOfBuilding, ReadOnlyOwnerOfBuilding
from base.models import GarbageCollection, Building
from base.serializers import GarbageCollectionSerializer
from util.request_response_util import *

TRANSLATE = {"building": "building_id"}


class DefaultGarbageCollection(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def post(self, request):
        """
        Create new garbage collection
        """
        data = request_to_dict(request.data)

        garbage_collection_instance = GarbageCollection()

        set_keys_of_instance(garbage_collection_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(garbage_collection_instance):
            return r

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return post_success(serializer)


class GarbageCollectionIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent]

    def get(self, request, garbage_collection_id):
        """
        Get info about a garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return bad_request("GarbageCollection")
        serializer = GarbageCollectionSerializer(garbage_collection_instance[0])
        return get_success(serializer)

    def delete(self, request, garbage_collection_id):
        """
        Delete garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return bad_request("GarbageCollection")
        garbage_collection_instance[0].delete()
        return delete_success()

    def patch(self, request, garbage_collection_id):
        """
        Edit garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return bad_request("GarbageCollection")

        garbage_collection_instance = garbage_collection_instance[0]
        data = request_to_dict(request.data)

        set_keys_of_instance(garbage_collection_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(garbage_collection_instance):
            return r

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return patch_success(serializer)


class GarbageCollectionIndividualBuildingView(APIView):
    """
    /building/<buildingid>
    """

    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | ReadOnlyOwnerOfBuilding]

    def get(self, request, building_id):
        """
        Get info about all garbage collections of a building with given id
        """
        building_instance = Building.objects.filter(building_id=building_id)
        if not (building_instance):
            bad_request(building_instance)
        self.check_object_permissions(request, building_instance[0])

        garbage_collection_instances = GarbageCollection.objects.filter(building=building_id)
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_success(serializer)


class GarbageCollectionAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def get(self, request):
        """
        Get all garbage collections
        """
        garbage_collection_instances = GarbageCollection.objects.all()
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_success(serializer)
