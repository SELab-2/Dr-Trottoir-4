from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from base.models import GarbageCollection
from base.serializers import GarbageCollectionSerializer


def _bad_request():
    return Response(
        {"res": "Object with given garbage collection ID does not exists."},
        status=status.HTTP_400_BAD_REQUEST
    )


class DefaultGarbageCollection(APIView):

    def post(self, request):
        """
        Create new garbage collection
        """

        data = request.data.dict()

        if "building" in data:
            data["building_id"] = data["building"]

        garbage_collection_instance = GarbageCollection()

        for key in data.keys():
            if key in vars(garbage_collection_instance):
                setattr(garbage_collection_instance, key, data[key])

        try:
            garbage_collection_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        garbage_collection_instance.save()

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GarbageCollectionIndividualView(APIView):

    def get(self, request, garbage_collection_id):
        """
        Get info about a garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return _bad_request()
        serializer = GarbageCollectionSerializer(garbage_collection_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, garbage_collection_id):
        """
        Delete garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return _bad_request()
        garbage_collection_instance[0].delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, garbage_collection_id):
        """
        Edit garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return _bad_request()

        garbage_collection_instance = garbage_collection_instance[0]
        data = request.data.dict()

        if "building" in data:
            data["building_id"] = data["building"]

        for key in data.keys():
            if key in vars(garbage_collection_instance):
                setattr(garbage_collection_instance, key, data[key])

        try:
            garbage_collection_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        garbage_collection_instance.save()
        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GarbageCollectionIndividualBuildingView(APIView):
    """
    /building/<buildingid>
    """

    def get(self, request, building_id):
        """
        Get info about all garbage collections of a building with given id
        """
        garbage_collection_instances = GarbageCollection.objects.filter(building=building_id)
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GarbageCollectionAllView(APIView):

    def get(self, request):
        """
        Get all garbage collections
        """
        garbage_collection_instances = GarbageCollection.objects.all()
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
