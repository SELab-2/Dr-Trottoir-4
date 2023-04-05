from django.urls import path

from .views import (
    StudentOnTourIndividualView,
    TourPerStudentView,
    AllView,
    Default,
)

urlpatterns = [
    path(
        "<int:student_on_tour_id>/",
        StudentOnTourIndividualView.as_view(),
    ),
    path("student/<int:student_id>/", TourPerStudentView.as_view()),
    path("all/", AllView.as_view()),
    path("", Default.as_view()),
]
