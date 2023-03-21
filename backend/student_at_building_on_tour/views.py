from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from base.models import StudentAtBuildingOnTour
from base.serializers import StudBuildTourSerializer
from util.request_response_util import *

TRANSLATE = {"building_on_tour": "building_on_tour_id", "student": "student_id"}


class Default(APIView):
    serializer_class = StudBuildTourSerializer

    @extend_schema(responses={201: StudBuildTourSerializer, 400: None})
    def post(self, request):
        """
        Create a new StudentAtBuildingOnTour
        """
        data = request_to_dict(request.data)
        student_at_building_on_tour_instance = StudentAtBuildingOnTour()

        set_keys_of_instance(student_at_building_on_tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(student_at_building_on_tour_instance):
            return r

        return post_success(
            StudBuildTourSerializer(student_at_building_on_tour_instance)
        )


class BuildingTourPerStudentView(APIView):
    serializer_class = StudBuildTourSerializer

    def get(self, request, student_id):
        """
        Get all StudentAtBuildingOnTour for a student with given id
        """
        student_at_building_on_tour_instances = StudentAtBuildingOnTour.objects.filter(
            student_id=student_id
        )
        serializer = StudBuildTourSerializer(
            student_at_building_on_tour_instances, many=True
        )
        return get_success(serializer)


class StudentAtBuildingOnTourIndividualView(APIView):
    serializer_class = StudBuildTourSerializer

    @extend_schema(responses={200: StudBuildTourSerializer, 400: None})
    def get(self, request, student_at_building_on_tour_id):
        """
        Get an individual StudentAtBuildingOnTour with given id
        """
        stud_tour_building_instance = StudentAtBuildingOnTour.objects.filter(
            id=student_at_building_on_tour_id
        )

        if len(stud_tour_building_instance) != 1:
            return bad_request("StudentAtBuildingOnTour")

        serializer = StudBuildTourSerializer(stud_tour_building_instance[0])
        return get_success(serializer)

    @extend_schema(responses={200: StudBuildTourSerializer, 400: None})
    def patch(self, request, student_at_building_on_tour_id):
        """
        Edit info about an individual StudentAtBuildingOnTour with given id
        """
        stud_tour_building_instances = StudentAtBuildingOnTour.objects.filter(
            id=student_at_building_on_tour_id
        )

        if len(stud_tour_building_instances) != 1:
            return bad_request("StudentAtBuildingOnTour")

        stud_tour_building_instance = stud_tour_building_instances[0]

        data = request_to_dict(request.data)

        set_keys_of_instance(stud_tour_building_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(stud_tour_building_instance):
            return r

        serializer = StudBuildTourSerializer(stud_tour_building_instance)
        return patch_success(serializer)

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, student_at_building_on_tour_id):
        """
        Delete StudentAtBuildingOnTour with given id
        """
        stud_tour_building_instances = StudentAtBuildingOnTour.objects.filter(
            id=student_at_building_on_tour_id
        )
        if len(stud_tour_building_instances) != 1:
            return bad_request("StudentAtBuildingOnTour")
        stud_tour_building_instances[0].delete()
        return delete_success()


class AllView(APIView):
    serializer_class = StudBuildTourSerializer

    def get(self, request):
        """
        Get all StudentAtBuildingOnTours
        """
        stud_tour_building_instance = StudentAtBuildingOnTour.objects.all()

        serializer = StudBuildTourSerializer(stud_tour_building_instance, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
