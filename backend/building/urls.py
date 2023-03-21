from django.urls import path

from .views import (
    BuildingIndividualView,
    BuildingOwnerView,
    AllBuildingsView,
    DefaultBuilding,
    BuildingPublicView,
    BuildingNewPublicId
)

urlpatterns = [
    path("<int:building_id>/", BuildingIndividualView.as_view()),
    path("all/", AllBuildingsView.as_view()),
    path("owner/<int:owner_id>/", BuildingOwnerView.as_view()),
    path("public/<building_public_id>/", BuildingPublicView.as_view()),
    path("new_public_id/<int:building_id>/", BuildingNewPublicId.as_view()),
    path("", DefaultBuilding.as_view()),
]
