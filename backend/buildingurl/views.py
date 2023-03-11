from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from base.models import BuildingURL, Building
from base.serializers import BuildingUrlSerializer


def _bad_request():
    return Response(
        {"res": "Object with given building ID does not exists."},
        status=status.HTTP_400_BAD_REQUEST
    )


class BuildingUrlDefault(APIView):

    def post(self, request):
        """
        Create a new building url
        """
        data = request.data.dict()

        building_url_instance = BuildingURL()

        if "building" in data.keys():
            data["building_id"] = data["building"]

        for key in data.keys():
            if key in vars(building_url_instance):
                setattr(building_url_instance, key, data[key])

        building_url_instance.save()
        serializer = BuildingUrlSerializer(building_url_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BuildingUrlIndividualView(APIView):

    def get(self, request, building_url_id):
        """
        Get info about a buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return _bad_request()

        serializer = BuildingUrlSerializer(building_url_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, building_url_id):
        """
        Delete buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return _bad_request()

        building_url_instance[0].delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, building_url_id):
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return _bad_request()

        building_url_instance = building_url_instance[0]
        data = request.data.dict()

        if "building" in data.keys():
            data["building_id"] = data["building"]

        for key in data.keys():
            if key in vars(building_url_instance):
                setattr(building_url_instance, key, data[key])

        building_url_instance.save()
        serializer = BuildingUrlSerializer(building_url_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BuildingUrlSyndicView(APIView):
    """
    /syndic/<syndic_id>
    """

    def get(self, request, syndic_id):
        """
        Get all building urls of buildings where the user with given user id is syndic
        """

        # All building IDs where user is syndic
        building_ids = [building.id for building in Building.objects.filter(syndic=syndic_id)]

        building_urls_instances = BuildingURL.objects.filter(building__in=building_ids)
        serializer = BuildingUrlSerializer(building_urls_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BuildingUrlBuildingView(APIView):
    """
    building/<building_id>
    """

    def get(self, request, building_id):
        """
        Get all building urls of a given building
        """
        building_url_instances = BuildingURL.objects.filter(building=building_id)
        serializer = BuildingUrlSerializer(building_url_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BuildingUrlAllView(APIView):

    def get(self, request):
        """
        Get all building urls
        """
        building_url_instances = BuildingURL.objects.all()
        serializer = BuildingUrlSerializer(building_url_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
