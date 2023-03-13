from django.urls import path

from .views import (
    stud_build_tourIndividualView,
    build_tour_per_studentView,
    AllView,
    Default
)

urlpatterns = [
    path('<int:id>/', stud_build_tourIndividualView.as_view()),
    path('student/<int:student_id>/', build_tour_per_studentView.as_view()),
    path('all/', AllView.as_view()),
    path('', Default.as_view())
]