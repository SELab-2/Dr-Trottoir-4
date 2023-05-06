from django.core.exceptions import BadRequest
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from analysis.serializers import WorkedHoursAnalysisSerializer
from base.models import StudentOnTour
from base.permissions import IsAdmin, IsSuperStudent
from util.request_response_util import get_success, get_filter_object, filter_instances, \
    bad_request_custom_error_message


class WorkedHoursAnalysis(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = WorkedHoursAnalysisSerializer

    def get(self, request):
        """
        Get all worked hours for each student for a certain period
        """
        student_on_tour_instances = StudentOnTour.objects.all()
        filters = {
            "start_date": get_filter_object("date__gte", required=True),
            "end_date": get_filter_object("date__lte", required=True),
            "region": get_filter_object("tour__region"),
        }

        try:
            student_on_tour_instances = filter_instances(request, student_on_tour_instances, filters)
        except BadRequest as e:
            return bad_request_custom_error_message(str(e))

        return get_success(self.serializer_class(student_on_tour_instances))
