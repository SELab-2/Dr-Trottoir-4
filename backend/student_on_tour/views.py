from datetime import datetime

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import StudentOnTour
from base.permissions import IsAdmin, IsSuperStudent, OwnerAccount, ReadOnlyOwnerAccount, IsStudent
from base.serializers import StudOnTourSerializer
from util.request_response_util import *

TRANSLATE = {"tour": "tour_id", "student": "student_id"}


def get_date_range_param(request, name):
    param = request.GET.get(name, None)
    if param:
        param = datetime.strptime(param, '%Y-%m-%d')
    return param


class Default(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = StudOnTourSerializer

    @extend_schema(responses=post_docs(StudOnTourSerializer))
    def post(self, request):
        """
        Create a new StudentOnTour
        """
        data = request_to_dict(request.data)
        student_on_tour_instance = StudentOnTour()

        set_keys_of_instance(student_on_tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(student_on_tour_instance):
            return r

        return post_success(StudOnTourSerializer(student_on_tour_instance))


class TourPerStudentView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = StudOnTourSerializer

    def get(self, request, student_id):
        """
        Get all StudentOnTour for a student with given id
        """
        start_date = get_date_range_param(request, 'start-date')
        end_date = get_date_range_param(request, 'end-date')
        id_holder = type("", (), {})()
        id_holder.id = student_id
        self.check_object_permissions(request, id_holder)
        student_on_tour_instances = StudentOnTour.objects.filter(
            student_id=student_id,
            date__gte=start_date,
            date__lte=end_date
        )
        serializer = StudOnTourSerializer(student_on_tour_instances, many=True)
        return get_success(serializer)


class StudentOnTourIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & ReadOnlyOwnerAccount)]
    serializer_class = StudOnTourSerializer

    @extend_schema(responses=get_docs(StudOnTourSerializer))
    def get(self, request, student_on_tour_id):
        """
        Get an individual StudentOnTour with given id
        """
        stud_tour_instances = StudentOnTour.objects.filter(id=student_on_tour_id)

        if len(stud_tour_instances) != 1:
            return not_found("StudentOnTour")
        stud_tour_instance = stud_tour_instances[0]

        self.check_object_permissions(request, stud_tour_instance.student)

        serializer = StudOnTourSerializer(stud_tour_instance)
        return get_success(serializer)

    @extend_schema(responses=patch_docs(StudOnTourSerializer))
    def patch(self, request, student_on_tour_id):
        """
        Edit info about an individual StudentOnTour with given id
        """
        stud_tour_instances = StudentOnTour.objects.filter(id=student_on_tour_id)

        if len(stud_tour_instances) != 1:
            return not_found("StudentOnTour")

        stud_tour_instance = stud_tour_instances[0]

        self.check_object_permissions(request, stud_tour_instance.student)

        data = request_to_dict(request.data)

        set_keys_of_instance(stud_tour_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(stud_tour_instance):
            return r

        serializer = StudOnTourSerializer(stud_tour_instance)
        return patch_success(serializer)

    @extend_schema(responses=delete_docs())
    def delete(self, request, student_on_tour_id):
        """
        Delete StudentOnTour with given id
        """
        stud_tour_instances = StudentOnTour.objects.filter(id=student_on_tour_id)
        if len(stud_tour_instances) != 1:
            return not_found("StudentOnTour")
        stud_tour_instance = stud_tour_instances[0]

        self.check_object_permissions(request, stud_tour_instance.student)

        stud_tour_instance.delete()
        return delete_success()


class AllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = StudOnTourSerializer

    def get(self, request):
        """
        Get all StudentOnTours
        """
        # get the query parameters
        start_date = get_date_range_param(request, 'start-date')
        end_date = get_date_range_param(request, 'end-date')
        student = request.GET.get('student', None)
        tour = request.GET.get('tour', None)
        region = request.GET.get('region', None)
        # query and filter
        stud_on_tour_instances = StudentOnTour.objects.all()
        if tour:
            stud_on_tour_instances = stud_on_tour_instances.filter(tour=tour)
        if region:
            stud_on_tour_instances = stud_on_tour_instances.filter(tour__region=region)
        if start_date:
            stud_on_tour_instances = stud_on_tour_instances.filter(date__gte=start_date)
        if end_date:
            stud_on_tour_instances = stud_on_tour_instances.filter(date__lte=end_date)
        if student:
            stud_on_tour_instances = stud_on_tour_instances.filter(student_id=student)

        serializer = StudOnTourSerializer(stud_on_tour_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
