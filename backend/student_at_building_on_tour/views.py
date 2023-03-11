from base.models import StudentAtBuildingOnTour, User, BuildingOnTour
from base.serializers import StudBuildTourSerializer
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class Default(APIView):
    def post(self, request):
        data = request.data
        buildingOnTour = data.get("building_on_tour")
        date = data.get("date")
        student = data.get("student")
        if not buildingOnTour or not date or not student:
            return Response('"building_on_tour", "date" and "student" fields are required', status.HTTP_400_BAD_REQUEST)
        candidates = BuildingOnTour.objects.filter(id=buildingOnTour)
        if len(candidates) != 1:
            return Response('"building_on_tour" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        building_instance = candidates[0]
        candidates2 = User.objects.filter(id=student)
        if len(candidates2) != 1:
            return Response('"student" field was not valid', status=status.HTTP_400_BAD_REQUEST)
        student_instance = candidates2[0]

        sbt = StudentAtBuildingOnTour(building_on_tour=building_instance, student=student_instance, date=date)
        try:
            sbt.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        sbt.save()
        return Response(status=status.HTTP_201_CREATED)


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
        stud_tour_building_instance = StudentAtBuildingOnTour.objects.filter(id=id)

        if len(stud_tour_building_instance) != 1:
            return Response(
                {"res": "Object with given id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = StudBuildTourSerializer(stud_tour_building_instance[0])
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        stud_tour_building_instances = StudentAtBuildingOnTour.objects.filter(id=id)

        if len(stud_tour_building_instances) != 1:
            return Response(
                {"res": "Object with given id does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        stud_tour_building_instance = stud_tour_building_instances[0]
        data = request.data
        buildingOnTour = data.get("building_on_tour")
        date = data.get("date")
        student = data.get("student")
        if buildingOnTour:
            candidates = BuildingOnTour.objects.filter(id=buildingOnTour)
            if len(candidates) != 1:
                return Response('"building_on_tour" field was not valid', status=status.HTTP_400_BAD_REQUEST)
            building_instance = candidates[0]
            stud_tour_building_instance.building_on_tour = building_instance
        if date:
            stud_tour_building_instance.date = date
        if student:
            candidates2 = User.objects.filter(id=student)
            if len(candidates2) != 1:
                return Response('"student" field was not valid', status=status.HTTP_400_BAD_REQUEST)
            student_instance = candidates2[0]
            stud_tour_building_instance.student = student_instance
        try:
            stud_tour_building_instance.full_clean()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        stud_tour_building_instance.save()
        return Response(status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_204_NO_CONTENT)

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
        stud_tour_building_instance = StudentAtBuildingOnTour.objects.all()

        serializer = StudBuildTourSerializer(stud_tour_building_instance, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
