from django.urls import path

from .views import ManualView, ManualBuildingView, ManualsView, Default

urlpatterns = [
    path("<int:manual_id>/", ManualView.as_view()),
    path("building/<int:building_id>/", ManualBuildingView.as_view()),
    path("all/", ManualsView.as_view()),
    path("", Default.as_view()),
]
