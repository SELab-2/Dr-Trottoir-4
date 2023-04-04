from queue import PriorityQueue

from drf_spectacular.utils import extend_schema, OpenApiExample
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import Tour, BuildingOnTour, Building
from base.permissions import IsAdmin, IsSuperStudent, ReadOnlyStudent
from base.serializers import TourSerializer, BuildingSerializer, SuccessSerializer, BuildingSwapRequestSerializer
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

    description = "Note that buildingID should also be an integer."

    @extend_schema(
        description="POST body consists of a list of building_id - index pairs that will be assigned to this tour. "
                    "This enables the frontend to restructure a tour in 1 request instead of multiple. If a building is "
                    "added to the tour (no BuildingOnTour entry existed before), a new entry will be created. If buildings that "
                    "were originally on the tour are left out, they will be removed from the tour."
                    "The indices that should be used in the request start at 0 and should be incremented 1 at a time.",
        request=BuildingSwapRequestSerializer,
        responses={200: SuccessSerializer, 400: None},
        examples=[
            OpenApiExample(
                "Set 2 buildings on the tour",
                value={"buildingID1": 0, "buildingID2": 1},
                description=description,
                request_only=True,
            ),
            OpenApiExample(
                "Reorder more than 2 buildings",
                value={"buildingID1": 1, "buildingID2": 3, "buildingID3": 2, "buildingID4": 0},
                description=description + " The new order of buildings will be [4,1,3,2]",
                request_only=True,
            ),
        ],
    )
    def post(self, request, tour_id):
        data = request_to_dict(request.data)
        print(data)
        tour = Tour.objects.filter(id=tour_id).first()
        if not tour:
            return not_found("Tour")
        items = BuildingOnTour.objects.filter(tour=tour)
        items.delete()
        q = PriorityQueue()
        max_index = -1
        for b_id, i in data.items():
            index = int(i) + 1
            if index < 0:
                return bad_request("Index")
            if index > max_index:
                max_index = index
            q.put((index, b_id))
        if len(data.items()) > max_index:
            return bad_request("Index")
        while not q.empty():
            index, b_id = q.get()
            instance = BuildingOnTour(index=index, building_id=b_id, tour=tour)
            if r := try_full_clean_and_save(instance):
                return r

        dummy = type("", (), {})()
        dummy.data = {"data": "success"}
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
