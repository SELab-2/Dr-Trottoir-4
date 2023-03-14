from rest_framework.views import APIView

from base.models import GarbageCollection
from base.serializers import GarbageCollectionSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema


class DefaultGarbageCollection(APIView):
    serializer_class = GarbageCollectionSerializer

    @extend_schema(
        responses={201: GarbageCollectionSerializer}
    )
    def post(self, request):
        """
        Create new garbage collection
        """

        data = request_to_dict(request.data)

        if "building" in data:
            data["building_id"] = data["building"]

        garbage_collection_instance = GarbageCollection()

        for key in data.keys():
            if key in vars(garbage_collection_instance):
                setattr(garbage_collection_instance, key, data[key])

        if r := try_full_clean_and_save(garbage_collection_instance):
            return r

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return post_succes(serializer)


class GarbageCollectionIndividualView(APIView):
    serializer_class = GarbageCollectionSerializer

    @extend_schema(
        responses={200: GarbageCollectionSerializer,
                   400: None}
    )
    def get(self, request, garbage_collection_id):
        """
        Get info about a garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return bad_request("GarbageCollection")
        serializer = GarbageCollectionSerializer(garbage_collection_instance[0])
        return get_succes(serializer)

    @extend_schema(
        responses={204: None,
                   400: None}
    )
    def delete(self, request, garbage_collection_id):
        """
        Delete garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return bad_request("GarbageCollection")
        garbage_collection_instance[0].delete()
        return delete_succes()

    @extend_schema(
        responses={204: None,
                   400: None}
    )
    def patch(self, request, garbage_collection_id):
        """
        Edit garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return bad_request("GarbageCollection")

        garbage_collection_instance = garbage_collection_instance[0]
        data = request_to_dict(request.data)

        if "building" in data:
            data["building_id"] = data["building"]

        for key in data.keys():
            if key in vars(garbage_collection_instance):
                setattr(garbage_collection_instance, key, data[key])

        if r := try_full_clean_and_save(garbage_collection_instance):
            return r

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return patch_succes(serializer)


class GarbageCollectionIndividualBuildingView(APIView):
    """
    /building/<buildingid>
    """
    serializer_class = GarbageCollectionSerializer

    def get(self, request, building_id):
        """
        Get info about all garbage collections of a building with given id
        """
        garbage_collection_instances = GarbageCollection.objects.filter(building=building_id)
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_succes(serializer)


class GarbageCollectionAllView(APIView):
    serializer_class = GarbageCollectionSerializer

    def get(self, request):
        """
        Get all garbage collections
        """
        garbage_collection_instances = GarbageCollection.objects.all()
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_succes(serializer)
