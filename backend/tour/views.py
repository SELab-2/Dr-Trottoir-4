from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import Tour, BuildingOnTour, Building
from base.permissions import IsAdmin, IsSuperStudent, ReadOnlyStudent
from base.serializers import TourSerializer, BuildingTourSerializer, BuildingSerializer
from util.request_response_util import *

TRANSLATE = {"region": "region_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = TourSerializer

    @extend_schema(responses=post_docs(TourSerializer))
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
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent]
    serializer_class = TourSerializer

    @extend_schema(responses=get_docs(TourSerializer))
    def get(self, request, tour_id):
        """
        Get info about a Tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)

        if not tour_instances:
            return not_found(object_name="Tour")

        tour_instance = tour_instances[0]
        serializer = TourSerializer(tour_instance)
        return get_success(serializer)

    @extend_schema(responses=patch_docs(TourSerializer))
    def patch(self, request, tour_id):
        """
        Edit a tour with given id
        """
        tour_instance = Tour.objects.filter(id=tour_id)
        data = request_to_dict(request.data)

        if not tour_instance:
            return not_found(object_name="Tour")

        tour_instance = tour_instance[0]

        set_keys_of_instance(tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(tour_instance):
            return r

        return patch_success(TourSerializer(tour_instance))

    @extend_schema(responses=delete_docs())
    def delete(self, request, tour_id):
        """
        Delete a tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)

        if not tour_instances:
            return not_found(object_name="Tour")

        tour_instances[0].delete()
        return delete_success()


class AllBuildingsOnTourView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent]
    serializer_class = TourSerializer

    @extend_schema(responses=get_docs(TourSerializer))
    def get(self, request, tour_id):
        """
        Get all buildings on a tour with given id
        """
        building_on_tour_instances = BuildingOnTour.objects.filter(tour_id=tour_id)
        building_instances = Building.objects.filter(
            id__in=building_on_tour_instances.values_list("building_id", flat=True))

        serializer = BuildingSerializer(building_instances, many=True)
        return get_success(serializer)


class AllToursView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = TourSerializer

    @extend_schema(responses=get_docs(TourSerializer))
    def get(self, request):
        """
        Get all tours
        """
        tour_instances = Tour.objects.all()

        serializer = TourSerializer(tour_instances, many=True)
        return get_success(serializer)
