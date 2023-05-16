from django.urls import path

from analysis.views import WorkedHoursAnalysis, StudentOnTourAnalysis

urlpatterns = [
    path("worked-hours/", WorkedHoursAnalysis.as_view(), name="worked-hours-analysis"),
    path("student-on-tour/<int:student_on_tour_id>/", StudentOnTourAnalysis.as_view(), name="student-on-tour-analysis"),
]
