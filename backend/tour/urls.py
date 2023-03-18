from django.urls import path

from .views import TourIndividualView, AllToursView, Default

urlpatterns = [
    path("<int:tour_id>/", TourIndividualView.as_view()),
    path("all/", AllToursView.as_view()),
    path("", Default.as_view()),
]
