from django.urls import path

from .views import (
    BuildingIndividualView,
    BuildingOwnerView,
    AllBuildingsView,
    DefaultBuilding,
    BuildingPublicView,
    BuildingNewPublicId,
    AllBuildingsInRegionView,
    BuildingGetNewPublicId,
)

urlpatterns = [
    path("<int:building_id>/", BuildingIndividualView.as_view()),
    path("all/", AllBuildingsView.as_view()),
    path("region/<int:region_id>/", AllBuildingsInRegionView.as_view()),
    path("owner/<int:owner_id>/", BuildingOwnerView.as_view()),
    path("public/<building_public_id>/", BuildingPublicView.as_view()),
    path("new-public-id/<int:building_id>/", BuildingNewPublicId.as_view()),
    path("random-new-public-id/", BuildingGetNewPublicId.as_view()),
    path("", DefaultBuilding.as_view()),
]
