from django.core.exceptions import BadRequest
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from analysis.serializers import WorkedHoursAnalysisSerializer, StudentOnTourAnalysisSerializer
from base.models import StudentOnTour, RemarkAtBuilding
from base.permissions import IsAdmin, IsSuperStudent
from util.request_response_util import get_success, get_filter_object, filter_instances, \
    bad_request_custom_error_message, not_found, param_docs


class WorkedHoursAnalysis(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = WorkedHoursAnalysisSerializer

    @extend_schema(
        description="Get all worked hours for each student for a certain period",
        parameters=param_docs(
            {
                "start-date": ("Filter by start-date", True, OpenApiTypes.DATE),
                "end-date": ("Filter by end-date", True, OpenApiTypes.DATE),
                "region_id": ("Filter by region id", False, OpenApiTypes.INT),
            }
        ),
        responses={200: OpenApiResponse(
            description="All worked hours for each student for a certain period",
            examples=[
                OpenApiExample(
                    "Successful Response",
                    value=[
                        [
                            {
                                "student_id": 6,
                                "worked_minutes": 112,
                                "student_on_tour_ids": [
                                    1,
                                    6,
                                    9,
                                    56,
                                    57
                                ]
                            },
                            {
                                "student_id": 7,
                                "worked_minutes": 70,
                                "student_on_tour_ids": [
                                    2,
                                    26
                                ]
                            },
                        ]
                    ]
                )
            ]
        )},
    )
    def get(self, request):
        """
        Get all worked hours for each student for a certain period
        """
        student_on_tour_instances = StudentOnTour.objects.all()
        filters = {
            "start_date": get_filter_object("date__gte", required=True),
            "end_date": get_filter_object("date__lte", required=True),
            "region_id": get_filter_object("tour__region__id"),
        }

        try:
            student_on_tour_instances = filter_instances(request, student_on_tour_instances, filters)
        except BadRequest as e:
            return bad_request_custom_error_message(str(e))

        serializer = self.serializer_class()
        serialized_data = serializer.to_representation(student_on_tour_instances)
        return Response(serialized_data, status=status.HTTP_200_OK)


class StudentOnTourAnalysis(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = StudentOnTourAnalysisSerializer

    @extend_schema(
        description="Get a detailed view on a student on tour's timings",
        responses={
            200: OpenApiResponse(
                description="A list of buildings and their timings on this student on tour",
                examples=[
                    OpenApiExample(
                        "Successful Response",
                        value=[
                            {
                                "building_id": 2,
                                "expected_duration_in_seconds": 2700,
                                "arrival_time": "2023-05-08T08:01:52.264000Z",
                                "departure_time": "2023-05-08T08:07:49.868000Z",
                                "duration_in_seconds": 358
                            },
                            {
                                "building_id": 11,
                                "expected_duration_in_seconds": 3600,
                                "arrival_time": "2023-05-08T08:08:04.693000Z",
                                "departure_time": "2023-05-08T08:08:11.714000Z",
                                "duration_in_seconds": 7
                            },
                        ]
                    )
                ]
            )
        }
    )
    def get(self, request, student_on_tour_id):
        """
        Get a detailed view on a student on tour's timings
        """
        student_on_tour_instance = StudentOnTour.objects.get(id=student_on_tour_id)
        if not student_on_tour_instance:
            return not_found("StudentOnTour")

        remarks_at_buildings = RemarkAtBuilding.objects.filter(student_on_tour_id=student_on_tour_id)

        serializer = self.serializer_class()
        serialized_data = serializer.to_representation(remarks_at_buildings)
        return Response(serialized_data, status=status.HTTP_200_OK)
