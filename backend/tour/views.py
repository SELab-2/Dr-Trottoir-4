from queue import PriorityQueue

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import Tour, BuildingOnTour, Building
from base.permissions import IsAdmin, IsSuperStudent, ReadOnlyStudent
from base.serializers import TourSerializer, BuildingSerializer
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


class BuildingSwapView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = TourSerializer

    def post(self, request, tour_id):
        data = request_to_dict(request.data)
        tours = Tour.objects.filter(id=tour_id)
        if len(tours) != 1:
            return not_found("Tour")
        tour = tours[0]
        numberOfItems = len(BuildingOnTour.objects.filter(tour=tour))
        minimum_index = None
        maximum_index = -1
        q = PriorityQueue()
        collisionMap = {}
        for b_id, i in data.items():
            index = int(i) + 1
            if minimum_index is None or index < minimum_index:
                minimum_index = index
            if index > maximum_index:
                maximum_index = index
            collisions = BuildingOnTour.objects.filter(tour=tour, index=index)
            if len(collisions) != 1:
                # it should exist, since we can only reuse indices
                return not_found("BuildingOnTour")
            collision = collisions[0]
            collisionMap[index] = collision.building.id
            q.put((index, b_id))
        new_temp = maximum_index
        if len(data.items()) > numberOfItems or maximum_index > len(data.items()):
            return bad_request("Swap")
        while not q.empty():
            index, b_id = q.get()
            candidates = BuildingOnTour.objects.filter(tour=tour, building=b_id)
            if len(candidates) != 1:
                return not_found("BuildingOnTour")
            collision_id = collisionMap[index]
            # one exists since it is in the collision map
            collision = BuildingOnTour.objects.filter(tour=tour, building=collision_id)[0]
            candidate = candidates[0]
            if collision.index == index:
                # later on the temp index will be overwritten with the new index from the request
                collision.index = new_temp + 1
                collision.save()
            candidate.index = index
            candidate.save()
            new_temp += 1
        dummy = type("", (), {})()
        dummy.data = {
            "data": "succesfully swapped the buildings"
        }
        return post_success(serializer=dummy)


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
    serializer_class = BuildingSerializer

    @extend_schema(responses=get_docs(BuildingSerializer))
    def get(self, request, tour_id):
        """
        Get all buildings on a tour with given id
        """
        building_on_tour_instances = BuildingOnTour.objects.filter(tour_id=tour_id)
        building_instances = Building.objects.filter(
            id__in=building_on_tour_instances.values_list("building_id", flat=True)
        )

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
