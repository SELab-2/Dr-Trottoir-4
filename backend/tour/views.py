from base.models import Tour, Region
from base.serializers import TourSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


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
        b.save()
        serializer = TourSerializer(b)
        return Response(serializer.data, status.HTTP_201_CREATED)


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
