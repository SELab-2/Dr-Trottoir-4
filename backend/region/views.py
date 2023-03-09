from base.models import Region
from base.serializers import RegionSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    def post(self, request):
        """
        Create a new region with name from post
        """
        data = request.data
        name = data.get("name")
        if not name:
            return Response('"name" field is required', status.HTTP_400_BAD_REQUEST)
        b = Region(region=name)
        b.save()
        serializer = RegionSerializer(b)
        return Response(serializer.data, status.HTTP_201_CREATED)


class RegionIndividualView(APIView):

    def get(self, request, region_id):
        """
        Get info about a Region with given id
        """
        region_instance = Region.objects.get(id=region_id)

        if not region_instance:
            return Response(
                {"res": "Object with given region id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = RegionSerializer(region_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, region_id):
        """
        edit info about a Region with given id
        """
        region_instance = Region.objects.get(id=region_id)
        if not region_instance:
            return Response(
                {"res": "Object with given region id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        data = request.data
        name = data.get("name")
        print(name)
        if not name:
            return Response('"name" field is required', status.HTTP_400_BAD_REQUEST)
        region_instance.region = name
        region_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AllRegionsView(APIView):
    def get(self, request):
        """
        Get all regions
        """
        region_instances = Region.objects.all()

        if not region_instances:
            return Response(
                {"res", "No regions found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RegionSerializer(region_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
