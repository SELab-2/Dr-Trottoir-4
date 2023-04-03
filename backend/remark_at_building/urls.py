from django.urls import path

from remark_at_building.views import *

urlpatterns = [
    path("<int:remark_at_building_id>/", RemarkAtBuildingIndividualView.as_view()),
    path("all/", AllRemarkAtBuilding.as_view()),
    path("", Default.as_view())
]
