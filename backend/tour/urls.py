from django.urls import path

from .views import TourIndividualView, AllToursView, Default, AllBuildingsOnTourView, BuildingSwapView

urlpatterns = [
    path("<int:tour_id>/", TourIndividualView.as_view()),
    path("<int:tour_id>/sequence/", BuildingSwapView.as_view()),
    path("<int:tour_id>/buildings/", AllBuildingsOnTourView.as_view()),
    path("all/", AllToursView.as_view()),
    path("", Default.as_view()),
]
