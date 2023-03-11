from base.models import Region
from base.serializers import RegionSerializer
from django.core.exceptions import NON_FIELD_ERRORS
from django.core.exceptions import ValidationError
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
        try:
            b.full_clean()
        except ValidationError as e:
            print(e)
            return Response(e.message_dict, status.HTTP_400_BAD_REQUEST)
        b.save()
        serializer = RegionSerializer(b)
        return Response(serializer.data, status.HTTP_201_CREATED)


class RegionIndividualView(APIView):

    def get(self, request, region_id):
        """
        Get info about a Region with given id
        """
        region_instance = Region.objects.filter(id=region_id)

        if len(region_instance) != 1:
            return Response(
                {"res": "Object with given region id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = RegionSerializer(region_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, region_id):
        """
        edit info about a Region with given id
        """
        region_instances = Region.objects.filter(id=region_id)
        if len(region_instances) != 1:
            return Response(
                {"res": "Object with given region id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        region_instance = region_instances[0]
        data = request.data
        name = data.get("name")
        if not name:
            return Response('"name" field is required', status.HTTP_400_BAD_REQUEST)
        region_instance.region = name
        try:
            region_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        region_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, region_id):
        """
        delete a region from the database
        """
        region_instances = Region.objects.filter(id=region_id)
        if len(region_instances) != 1:
            return Response(
                {"res": "Object with given region id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        region_instances[0].delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AllRegionsView(APIView):
    def get(self, request):
        """
        Get all regions
        """
        region_instances = Region.objects.all()
        serializer = RegionSerializer(region_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
