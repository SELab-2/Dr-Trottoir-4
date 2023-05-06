from drf_spectacular.utils import extend_schema, OpenApiExample
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import StudentOnTour
from base.permissions import IsAdmin, IsSuperStudent, OwnerAccount, ReadOnlyOwnerAccount, IsStudent
from base.serializers import StudOnTourSerializer, SuccessSerializer
from util.request_response_util import *

TRANSLATE = {"tour": "tour_id", "student": "student_id"}


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


class StudentOnTourBulk(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = StudOnTourSerializer

    @extend_schema(
        description="POST body consists of a data component that is a list of Student-Tour instances. "
        "This enables the frontend to save a schedule in 1 request instead of multiple. "
        "If a save fails, all the previous saves will be undone as well.",
        request=StudOnTourSerializer,
        responses={200: SuccessSerializer, 400: None},
        examples=[
            OpenApiExample(
                "Request body for bulk add",
                value={
                    "data": [
                        {"tour": 0, "student": 3, "date": "2023-04-28"},
                        {"tour": 1, "student": 2, "date": "2023-04-28"},
                    ]
                },
                description="",
                request_only=True,
            )
        ],
    )
    def post(self, request):
        data = request_to_dict(request.data)
        """
        request body should look like this:
        {
            data:
            [
                {Tour:x, student:x, date: x},
                {Tour:x2, student:x, date: x2},
                // more of this
            ]
        }
        """
        list_done = []
        for d in data["data"]:
            student_on_tour_instance = StudentOnTour()

            set_keys_of_instance(student_on_tour_instance, d, TRANSLATE)

            if r := try_full_clean_and_save(student_on_tour_instance):
                for elem in list_done:
                    elem.delete()
                return r
            list_done.append(student_on_tour_instance)

        dummy = type("", (), {})()
        dummy.data = {"data": "success"}

        return post_success(serializer=dummy)

    @extend_schema(
        description="DELETE body consists of an ids component that is a list of Student-Tour instances. "
        "This enables the frontend to remove assignments in a schedule in 1 request instead of multiple."
        "If a remove fails, the previous removes will **NOT** be undone."
        """
                    <h3> special</h3>
                    <br/>**Request body for bulk remove:**<br/>
                    <i>
                        {
                            "ids":
                                [
                                    0,
                                    1,
                                    3
                                ]
                        }
                    </i>""",
        request=StudOnTourSerializer,
        responses={200: SuccessSerializer, 400: None},
    )
    def delete(self, request):
        data = request_to_dict(request.data)
        """
        request body should look like this:
        {
        ids:
            [
                id1,
                id2,
                id3,
                ...
            ]
        }
        """
        for d in data["ids"]:
            print(d)
            student_on_tour_instance = StudentOnTour.objects.filter(id=d).first()
            if not student_on_tour_instance:
                return not_found("StudentOnTour")
            student_on_tour_instance.delete()

        dummy = type("", (), {})()
        dummy.data = {"data": "success"}

        return post_success(serializer=dummy)

    @extend_schema(
        description="PATCH body is a map of ids on Student-Tour instances (with new data). "
        "This enables the frontend to edit a schedule in 1 request instead of multiple. "
        "If a save fails, the previous saves will **NOT** be undone.",
        request=StudOnTourSerializer,
        responses={200: SuccessSerializer, 400: None},
        examples=[
            OpenApiExample(
                "Request body for bulk edit",
                value={
                    0: {"tour": 0, "student": 3, "date": "2023-04-28"},
                    1: {"tour": 1, "student": 2, "date": "2023-04-28"},
                },
                description="**note that the ids should be strings, not integers**",
                request_only=True,
            )
        ],
    )
    def patch(self, request):
        data = request_to_dict(request.data)
        """
        request body should look like this:
        {
            id1: {tour:x, student: y, date:z},
            // more of this
        }
        """
        for StudentOnTour_id in data:
            print(StudentOnTour_id)
            student_on_tour_instance = StudentOnTour.objects.filter(id=StudentOnTour_id).first()
            if not student_on_tour_instance:
                return not_found("StudentOnTour")
            print(student_on_tour_instance)
            set_keys_of_instance(student_on_tour_instance, data[StudentOnTour_id], TRANSLATE)
            print(student_on_tour_instance)
            if r := try_full_clean_and_save(student_on_tour_instance):
                return r

        dummy = type("", (), {})()
        dummy.data = {"data": "success"}

        return post_success(serializer=dummy)


class TourPerStudentView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | (IsStudent & OwnerAccount)]
    serializer_class = StudOnTourSerializer

    @extend_schema(
        parameters=param_docs(
            {
                "start-date": ("Filter by start-date", False, OpenApiTypes.DATE),
                "end-date": ("Filter by end-date", False, OpenApiTypes.DATE),
            }
        )
    )
    def get(self, request, student_id):
        """
        Get all StudentOnTour for a student with given id
        """
        id_holder = type("", (), {})()
        id_holder.id = student_id
        self.check_object_permissions(request, id_holder)

        filters = {
            "start-date": get_filter_object("date__gte"),
            "end-date": get_filter_object("date__lte"),
        }
        student_on_tour_instances = StudentOnTour.objects.filter(student_id=student_id)
        try:
            student_on_tour_instances = filter_instances(request, student_on_tour_instances, filters)
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
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

    @extend_schema(
        parameters=param_docs(
            {
                "start-date": ("Filter by start date", False, OpenApiTypes.DATE),
                "end-date": ("Filter by end-date", False, OpenApiTypes.DATE),
                "student": ("Filter by student (ID)", False, OpenApiTypes.INT),
                "tour": ("Filter by tour (ID)", False, OpenApiTypes.INT),
                "region": ("Filter by region (ID)", False, OpenApiTypes.INT),
            }
        )
    )
    def get(self, request):
        """
        Get all StudentOnTours
        """
        filters = {
            "tour-id": get_filter_object("tour_id"),
            "region-id": get_filter_object("tour__region_id"),
            "start-date": get_filter_object("date__gte"),
            "end-date": get_filter_object("date__lte"),
            "student-id": get_filter_object("student_id"),
        }
        stud_on_tour_instances = StudentOnTour.objects.all()

        try:
            stud_on_tour_instances = filter_instances(request, stud_on_tour_instances, filters)
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = StudOnTourSerializer(stud_on_tour_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
