from django.urls import path

from .views import (
    DefaultBuildingComment,
    BuildingCommentIndividualView,
    BuildingCommentAllView,
    BuildingCommentBuildingView,
)

urlpatterns = [
    path("<int:building_comment_id>/", BuildingCommentIndividualView.as_view()),
    path("building/<building_id>/", BuildingCommentBuildingView.as_view()),
    path("all/", BuildingCommentAllView.as_view()),
    path("", DefaultBuildingComment.as_view()),
]
