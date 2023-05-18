from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import BuildingOnTour
from base.permissions import IsAdmin, IsSuperStudent, ReadOnlyStudent, NoStudentWorkingOnTour
from base.serializers import BuildingTourSerializer
from util.request_response_util import *

TRANSLATE = {"building": "building_id", "tour": "tour_id"}


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = BuildingTourSerializer

    @extend_schema(responses=post_docs(BuildingTourSerializer))
    def post(self, request):
        """
        Create a new BuildingOnTour with data from post
        """
        data = request_to_dict(request.data)
        building_on_tour_instance = BuildingOnTour()

        set_keys_of_instance(building_on_tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_on_tour_instance):
            return r

        serializer = BuildingTourSerializer(building_on_tour_instance)
        return post_success(serializer)


class BuildingTourIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent, NoStudentWorkingOnTour]
    serializer_class = BuildingTourSerializer

    @extend_schema(responses=get_docs(BuildingTourSerializer))
    def get(self, request, building_tour_id):
        """
        Get info about a BuildingOnTour with given id
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=building_tour_id).first()

        if not building_on_tour_instance:
            return not_found("BuildingOnTour")

        serializer = BuildingTourSerializer(building_on_tour_instance)
        return get_success(serializer)

    @extend_schema(responses=patch_docs(BuildingTourSerializer))
    def patch(self, request, building_tour_id):
        """
        edit info about a BuildingOnTour with given id
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=building_tour_id).first()

        if not building_on_tour_instance:
            return not_found("BuildingOnTour")

        self.check_object_permissions(request, building_on_tour_instance.tour)

        data = request_to_dict(request.data)

        set_keys_of_instance(building_on_tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_on_tour_instance):
            return r

        return patch_success(BuildingTourSerializer(building_on_tour_instance))

    @extend_schema(responses=delete_docs())
    def delete(self, request, building_tour_id):
        """
        delete a BuildingOnTour from the database
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=building_tour_id)

        if not building_on_tour_instance:
            return not_found("BuildingOnTour")

        building_on_tour_instance[0].delete()
        return delete_success()


class AllBuilingsOnTourInTourView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent]
    serializer_class = BuildingTourSerializer

    @extend_schema(responses=get_docs(BuildingTourSerializer))
    def get(self, request, tour_id):
        """
        Get all BuildingsOnTour with given tour id
        """
        building_on_tour_instances = BuildingOnTour.objects.filter(tour_id=tour_id)
        serializer = BuildingTourSerializer(building_on_tour_instances, many=True)
        return get_success(serializer)


class AllBuildingToursView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent]
    serializer_class = BuildingTourSerializer

    def get(self, request):
        """
        Get all buildings on tours
        """
        building_on_tour_instances = BuildingOnTour.objects.all()
        serializer = BuildingTourSerializer(building_on_tour_instances, many=True)
        return get_success(serializer)
