from django.urls import path

from .views import UserIndividualView, AllUsersView, DefaultUser

urlpatterns = [
    path("<int:user_id>/", UserIndividualView.as_view()),
    path("all/", AllUsersView.as_view()),
    path("", DefaultUser.as_view()),
]
