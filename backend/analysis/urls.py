from django.urls import path

from analysis.views import WorkedHoursAnalysis

urlpatterns = [
    path("worked-hours/", WorkedHoursAnalysis.as_view(), name="worked-hours-analysis"),
]