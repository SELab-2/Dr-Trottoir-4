from django.urls import path

from .views import (
    PictureBuildingIndividualView,
    PicturesOfBuildingView,
    AllPictureBuildingsView,
    Default
)

urlpatterns = [
    path('<int:pictureBuilding_id>/', PictureBuildingIndividualView.as_view()),
    path('building/<int:building_id>/', PicturesOfBuildingView.as_view()),
    path('all/', AllPictureBuildingsView.as_view()),
    path('', Default.as_view())
]
