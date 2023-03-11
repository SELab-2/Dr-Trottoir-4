from base.models import StudentAtBuildingOnTour
from base.serializers import StudBuildTourSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class stud_build_tourIndividualView(APIView):
    def get(self, request, id):
        pictureBuilding_instance = StudentAtBuildingOnTour.objects.filter(id=id)

        if len(pictureBuilding_instance) != 1:
            return Response(
                {"res": "Object with given id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = StudBuildTourSerializer(pictureBuilding_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        """
        delete from the database
        """
        possible_instances = StudentAtBuildingOnTour.objects.filter(id=id)
        if len(possible_instances) != 1:
            return Response(
                {"res": "Object with given id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        possible_instances[0].delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




class AllView(APIView):
    def get(self, request):
        """
        Get all data
        """
        picture_building_instances = StudentAtBuildingOnTour.objects.all()

        serializer = StudBuildTourSerializer(picture_building_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
