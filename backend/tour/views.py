from base.models import Tour
from base.serializers import TourSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.

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
