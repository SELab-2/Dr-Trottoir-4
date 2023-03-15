from django.urls import path

from .views import (
    RegionIndividualView,
    AllRegionsView,
    Default
)

urlpatterns = [
    path('<int:region_id>/', RegionIndividualView.as_view()),
    path('all/', AllRegionsView.as_view()),
    path('', Default.as_view())
]
