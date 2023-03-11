from base.models import StudentAtBuildingOnTour, User
from base.serializers import StudBuildTourSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


#
#
# class Default(APIView):
#     def post(self, request):
#         data = request.data
#         building = data.get("building")
#         tour = data.get("tour")
#         date = data.get("date")
#         if not building or not tour or not date:
#             return Response('"building", "tour" and "date" fields are required', status.HTTP_400_BAD_REQUEST)
#         candidates = Building.objects.filter(id=building)
#         if len(candidates) != 1:
#             return Response('"Building" field was not valid', status=status.HTTP_400_BAD_REQUEST)
#         building_instance = candidates[0]
#         candidates2 = Tour.objects.filter(id=tour)
#         if len(candidates2) != 1:
#             return Response('"Tour" field was not valid', status=status.HTTP_400_BAD_REQUEST)
#         tour_instance = candidates2[0]
#
#         sbt = StudentAtBuildingOnTour(building=building_instance, tour=tour_instance, date=date)
#         sbt.save()
#         return Response(status=status.HTTP_201_CREATED)


class build_tour_per_studentView(APIView):
    def get(self, request, student_id):
        stud_candidates = User.objects.filter(id=student_id)
        if len(stud_candidates) != 1:
            return Response('no entries for given student is', status=status.HTTP_400_BAD_REQUEST)
        student = stud_candidates[0]
        pictureBuilding_instance = StudentAtBuildingOnTour.objects.filter(student=student)

        serializer = StudBuildTourSerializer(pictureBuilding_instance, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
