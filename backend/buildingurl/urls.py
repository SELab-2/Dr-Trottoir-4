from django.urls import path

from .views import (
    BuildingUrlAllView,
    BuildingUrlIndividualView,
    BuildingUrlSyndicView,
    BuildingUrlBuildingView,
    BuildingUrlDefault
)

urlpatterns = [
    path('all/', BuildingUrlAllView.as_view()),
    path('<int:building_url_id>/', BuildingUrlIndividualView.as_view()),
    path('syndic/<int:syndic_id>/', BuildingUrlSyndicView.as_view()),
    path('building/<int:building_id>/', BuildingUrlBuildingView.as_view()),
    path('', BuildingUrlDefault.as_view())
]
