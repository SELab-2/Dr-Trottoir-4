from base.models import Tour, Region
from base.serializers import TourSerializer
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    def post(self, request):
        """
        Create a new tour with name from post
        """
        data = request.data
        name = data.get("name")
        region = data.get("region")
        modified_at = data.get("modified_at")
        if not name or not region or not modified_at:
            return Response('"name", "region" and "modified_at" fields are required', status.HTTP_400_BAD_REQUEST)
        b = Tour(name=name, region=Region.objects.get(id=region), modified_at=modified_at)
        try:
            b.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        b.save()
        serializer = TourSerializer(b)
        return Response(serializer.data, status.HTTP_201_CREATED)


class TourIndividualView(APIView):
    def get(self, request, tour_id):
        """
        Get info about a Tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)

        if not tour_instances:
            return Response(
                {"res": "Object with given tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        tour_instance = tour_instances[0]
        serializer = TourSerializer(tour_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, tour_id):
        """
        edit info about a tour with given id
        """
        tour_instances = Tour.objects.filter(id=tour_id)
        if not tour_instances:
            return Response(
                {"res": "Object with given tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
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
        try:
            tour_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        tour_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, tour_id):
        """
        delete a tour from the database
        """
        tour_instances = Tour.objects.filter(id=tour_id)
        if not tour_instances:
            return Response(
                {"res": "Object with given tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        tour_instance = tour_instances[0]
        tour_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AllToursView(APIView):
    def get(self, request):
        """
        Get all tours
        """
        tour_instances = Tour.objects.all()

        serializer = TourSerializer(tour_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
