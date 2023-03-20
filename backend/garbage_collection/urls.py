from django.urls import path

from .views import (
    GarbageCollectionIndividualView,
    GarbageCollectionIndividualBuildingView,
    DefaultGarbageCollection,
    GarbageCollectionAllView,
)

urlpatterns = [
    path("all/", GarbageCollectionAllView.as_view()),
    path("building/<building_id>/", GarbageCollectionIndividualBuildingView.as_view()),
    path("<garbage_collection_id>/", GarbageCollectionIndividualView.as_view()),
    path("", DefaultGarbageCollection.as_view()),
]
