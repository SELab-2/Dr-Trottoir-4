from django.urls import path

from .views import BuildingTourIndividualView, AllBuildingToursView, Default, AllBuilingsOnTourInTourView

urlpatterns = [
    path("<int:building_tour_id>/", BuildingTourIndividualView.as_view()),
    path("tour/<int:tour_id>/", AllBuilingsOnTourInTourView.as_view()),
    path("all/", AllBuildingToursView.as_view()),
    path("", Default.as_view()),
]
