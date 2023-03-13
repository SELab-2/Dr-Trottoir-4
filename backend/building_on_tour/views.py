from rest_framework.views import APIView

from base.models import BuildingOnTour
from base.serializers import BuildingTourSerializer
from util.request_response_util import *


class Default(APIView):
    def post(self, request):
        """
        Create a new BuildingOnTour with data from post
        """
        data = request_to_dict(request.data)
        building_on_tour_instance = BuildingOnTour()

        set_keys_of_instance(building_on_tour_instance, data, {"building": "building_id", "tour": "tour_id"})

        if r := try_full_clean_and_save(building_on_tour_instance):
            return r

        serializer = BuildingTourSerializer(building_on_tour_instance)
        return post_success(serializer)


class BuildingTourIndividualView(APIView):
    def get(self, request, building_tour_id):
        """
        Get info about a BuildingOnTour with given id
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=building_tour_id)

        if not building_on_tour_instance:
            return bad_request("BuildingOnTour")

        serializer = BuildingTourSerializer(building_on_tour_instance[0])
        return get_success(serializer)

    def patch(self, request, building_tour_id):
        """
        edit info about a BuildingOnTour with given id
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=building_tour_id)

        if not building_on_tour_instance:
            return bad_request("BuildingOnTour")

        building_on_tour_instance = building_on_tour_instance[0]

        data = request_to_dict(request.data)

        set_keys_of_instance(building_on_tour_instance, data, {"building": "building_id", "tour": "tour_id"})

        if r := try_full_clean_and_save(building_on_tour_instance):
            return r

        return patch_success(BuildingTourSerializer(building_on_tour_instance))

    def delete(self, request, building_tour_id):
        """
        delete a BuildingOnTour from the database
        """
        building_on_tour_instance = BuildingOnTour.objects.filter(id=building_tour_id)

        if not building_on_tour_instance:
            return bad_request("BuildingOnTour")

        building_on_tour_instance[0].delete()
        return delete_success()


class AllBuildingToursView(APIView):
    def get(self, request):
        """
        Get all buildings on tours
        """
        buildingOnTourInstances = BuildingOnTour.objects.all()
        serializer = BuildingTourSerializer(buildingOnTourInstances, many=True)
        return get_success(serializer)
