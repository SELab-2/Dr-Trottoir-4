from base.models import Tour, Region
from base.serializers import TourSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.exceptions import ValidationError

# Create your views here.


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
            print(e)
            return Response(e.message_dict["tour"], status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        b.save()
        serializer = TourSerializer(b)
        return Response(serializer.data, status.HTTP_201_CREATED)


class TourIndividualView(APIView):
    def get(self, request, tour_id):
        """
        Get info about a Tour with given id
        """
        tour_instance = Tour.objects.get(id=tour_id)

        if not tour_instance:
            return Response(
                {"res": "Object with given tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = TourSerializer(tour_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, tour_id):
        """
        edit info about a tour with given id
        """
        tour_instance = Tour.objects.get(id=tour_id)
        if not tour_instance:
            return Response(
                {"res": "Object with given tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        data = request.data
        name = data.get("name")
        region = data.get("region")
        modified_at = data.get("modified_at")
        if name:
            # return Response('"name", "region" and "modified_at" fields are required', status.HTTP_400_BAD_REQUEST)
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
            # print(e)
            return Response(e.message_dict["tour"], status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        tour_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, region_id):
        """
        delete a region from the database
        """
        tour_instance = Tour.objects.get(id=region_id)
        if not tour_instance:
            return Response(
                {"res": "Object with given tour id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        tour_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AllToursView(APIView):
    def get(self, request):
        """
        Get all tours
        """
        tour_instances = Tour.objects.all()

        if not tour_instances:
            return Response(
                {"res", "No tours found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TourSerializer(tour_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
