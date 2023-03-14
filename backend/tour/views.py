from rest_framework import permissions
from rest_framework.views import APIView

from base.models import Tour
from base.serializers import TourSerializer
from util.request_response_util import *

TRANSLATE = {"region": "region_id"}


class Default(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Create a new tour
        """
        data = request_to_dict(request.data)
        tour_instance = Tour()

        set_keys_of_instance(tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(tour_instance):
            return r

        return post_success(TourSerializer(tour_instance))


class TourIndividualView(APIView):
    def get(self, request, tour_id):
        """
        Get info about a Tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)

        if not tour_instances:
            return bad_request(object_name="Tour")

        tour_instance = tour_instances[0]
        serializer = TourSerializer(tour_instance)
        return get_success(serializer)

    def patch(self, request, tour_id):
        """
        Edit a tour with given id
        """
        tour_instance = Tour.objects.filter(id=tour_id)
        data = request_to_dict(request.data)

        if not tour_instance:
            return bad_request(object_name="Tour")

        tour_instance = tour_instance[0]

        set_keys_of_instance(tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(tour_instance):
            return r

        return patch_success(TourSerializer(tour_instance))

    def delete(self, request, tour_id):
        """
        Delete a tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)

        if not tour_instances:
            return bad_request(object_name="Tour")

        tour_instances[0].delete()
        return delete_success()


class AllToursView(APIView):
    def get(self, request):
        """
        Get all tours
        """
        tour_instances = Tour.objects.all()

        serializer = TourSerializer(tour_instances, many=True)
        return get_success(serializer)
