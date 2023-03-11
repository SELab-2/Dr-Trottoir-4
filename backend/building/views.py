from django.core.exceptions import ValidationError
from rest_framework import permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from base.models import Building
from base.serializers import BuildingSerializer


# TODO: code repetition


class DefaultBuilding(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # TODO: in order for this to work, you have to pass a password
    # In the future, we probably won't use POST this way anymore (if we work with the whitelist method)
    def post(self, request):
        """
        Create a new building
        """
        data = request.data.dict()

        if "syndic" in data.keys():
            data["syndic_id"] = data["syndic"]
            # del data["syndic"]

        building_instance = Building()

        for key in data.keys():
            if key in vars(building_instance):
                setattr(building_instance, key, data[key])

        try:
            building_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        building_instance.save()
        serializer = BuildingSerializer(building_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BuildingIndividualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _bad_request(self):
        return Response(
            {"res": "Object with given building ID does not exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request, building_id):
        """
        Get info about building with given id
        """
        building_instance = Building.objects.filter(id=building_id)

        if not building_instance:
            return self._bad_request()

        building_instance = building_instance[0]
        serializer = BuildingSerializer(building_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, building_id):
        """
        Delete building with given id
        """
        building_instance = Building.objects.filter(id=building_id)[0]
        if not building_instance:
            return self._bad_request()

        building_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, building_id):
        """
        Edit building with given ID
        """
        building_instance = Building.objects.filter(id=building_id)[0]
        if not building_instance:
            return self._bad_request()
        building_instance = building_instance[0]
        data = request.data.dict()

        if "syndic" in data.keys():
            data["syndic_id"] = data["syndic"]
            # del data["syndic"]

        for key in data.keys():
            if key in vars(building_instance):
                print(f"key: {key}")
                setattr(building_instance, key, data[key])

        try:
            building_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        building_instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AllBuildingsView(APIView):

    def get(self, request):
        """
        Get all buildings
        """
        building_instances = Building.objects.all()

        if not building_instances:
            return Response(
                {"res": "No buildings found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BuildingSerializer(building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BuildingOwnerView(APIView):

    def get(self, request, owner_id):
        """
        Get all buildings owned by syndic with given id
        """
        building_instance = Building.objects.filter(syndic=owner_id)

        if not building_instance:
            return Response(
                {"res": "Object with given building ID does not exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BuildingSerializer(building_instance, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
