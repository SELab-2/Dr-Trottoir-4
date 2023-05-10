import asyncio

import pytz
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

import config.settings
from base.models import StudentOnTour, User
from base.permissions import IsAdmin, IsSuperStudent, OwnerAccount, ReadOnlyOwnerAccount, IsStudent
from base.serializers import StudOnTourSerializer, ProgressTourSerializer
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
        stud_tour_instance = StudentOnTour.objects.filter(id=student_on_tour_id).first()

        if not stud_tour_instance:
            return not_found("StudentOnTour")

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

        return get_success(StudOnTourSerializer(stud_on_tour_instances, many=True))


class TimeTourViewBase(APIView):
    permission_classes = [IsAuthenticated, OwnerAccount]
    serializer_class = StudOnTourSerializer

    async def finalize_response(self, request, response, *args, **kwargs):
        if asyncio.iscoroutine(response):
            # Wait for the coroutine to finish and return its result
            response = await response
            return super().finalize_response(request, response, *args, **kwargs)

            # If the response is not a coroutine, return it as is
        return super().finalize_response(request, response, *args, **kwargs)

    @sync_to_async
    def check_permissions(self, request):
        super().check_permissions(request)

    @sync_to_async
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)

    @sync_to_async
    def perform_authentication(self, request):
        super().perform_authentication(request)

    async def set_tour_time(self, request, student_on_tour_id, field_name, event_type):
        student_on_tour_instance: StudentOnTour = await StudentOnTour.objects.filter(id=student_on_tour_id).afirst()
        student: User = await sync_to_async(lambda: student_on_tour_instance.student)()
        await self.check_object_permissions(request, student)

        tz = pytz.timezone(config.settings.TIME_ZONE)
        setattr(student_on_tour_instance, field_name, datetime.now(tz))

        await student_on_tour_instance.asave()
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "student_on_tour_updates",
            {
                "type": event_type,
                "student_on_tour_id": student_on_tour_instance.id,
            },
        )
        return post_success(self.serializer_class(student_on_tour_instance))


class StartTourView(TimeTourViewBase):
    @extend_schema(responses=post_docs(TimeTourViewBase.serializer_class))
    async def post(self, request, student_on_tour_id):
        return await self.set_tour_time(request, student_on_tour_id, "started_tour", "student.on.tour.started")


class EndTourView(TimeTourViewBase):
    @extend_schema(responses=post_docs(TimeTourViewBase.serializer_class))
    async def post(self, request, student_on_tour_id):
        return await self.set_tour_time(request, student_on_tour_id, "completed_tour", "student.on.tour.completed")


class ProgressTourView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = ProgressTourSerializer

    @extend_schema(responses=get_docs(serializer_class))
    def get(self, request, student_on_tour_id):
        student_on_tour = StudentOnTour.objects.get(id=student_on_tour_id)
        return get_success(ProgressTourSerializer(student_on_tour))
