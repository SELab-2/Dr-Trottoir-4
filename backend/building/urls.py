from django.urls import path

from .views import (
    BuildingIndividualView,
    BuildingOwnerView,
    AllBuildingsView
)

urlpatterns = [
    path('<int:building_id>/', BuildingIndividualView.as_view()),
    path('all/', AllBuildingsView.as_view()),
    path('owner/<int:owner_id>/', BuildingOwnerView.as_view()),
]
