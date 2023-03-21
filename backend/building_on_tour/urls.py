from django.urls import path

from .views import BuildingTourIndividualView, AllBuildingToursView, Default

urlpatterns = [
    path("<int:building_tour_id>/", BuildingTourIndividualView.as_view()),
    path("all/", AllBuildingToursView.as_view()),
    path("", Default.as_view()),
]
