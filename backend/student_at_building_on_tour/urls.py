from django.urls import path

from .views import (
    StudentAtBuildingOnTourIndividualView,
    BuildingTourPerStudentView,
    AllView,
    Default
)

urlpatterns = [
    path('<int:student_at_building_on_tour_id>/', StudentAtBuildingOnTourIndividualView.as_view()),
    path('student/<int:student_id>/', BuildingTourPerStudentView.as_view()),
    path('all/', AllView.as_view()),
    path('', Default.as_view())
]
