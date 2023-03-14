from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from authorisation.permissions import IsAdmin, IsSuperStudent, ReadOnlyStudent
from base.models import Tour, Region
from base.serializers import TourSerializer
from util.request_response_util import *


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def post(self, request):
        """
        Create a new tour
        """
        data = request.data
        name = data.get("name")
        region = data.get("region")
        modified_at = data.get("modified_at")
        if not name or not region or not modified_at:
            return Response('"name", "region" and "modified_at" fields are required', status.HTTP_400_BAD_REQUEST)
        candidates = Region.objects.filter(id=region)
        if len(candidates) != 1:
            return bad_request(object_name="Region")
        b = Tour(name=name, region=candidates[0], modified_at=modified_at)
        if r := try_full_clean_and_save(b):
            return r
        return patch_succes(TourSerializer(b))


class TourIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent]

    def get(self, request, tour_id):
        """
        Get info about a Tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)

        if not tour_instances:
            return bad_request(object_name="Tour")
        tour_instance = tour_instances[0]
        serializer = TourSerializer(tour_instance)
        return get_succes(serializer)

    def patch(self, request, tour_id):
        """
        edit a tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)
        if not tour_instances:
            return bad_request(object_name="Tour")
        tour_instance = tour_instances[0]
        data = request.data
        name = data.get("name")
        region = data.get("region")
        modified_at = data.get("modified_at")
        if name:
            tour_instance.name = name
        if region:
            r = Region.objects.filter(id=region)
            if len(r) == 0:
                return Response('"region" field was not valid', status.HTTP_400_BAD_REQUEST)
            tour_instance.region = r[0]
        if modified_at:
            tour_instance.modified_at = modified_at
        if r := try_full_clean_and_save(tour_instance):
            return r
        serializer = TourSerializer(tour_instance)
        return patch_succes(serializer)

    def delete(self, request, tour_id):
        """
        delete a tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)
        if not tour_instances:
            return bad_request(object_name="Tour")
        tour_instance = tour_instances[0]
        tour_instance.delete()
        return delete_succes()


class AllToursView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]

    def get(self, request):
        """
        Get all tours
        """
        tour_instances = Tour.objects.all()

        serializer = TourSerializer(tour_instances, many=True)
        return get_succes(serializer)
