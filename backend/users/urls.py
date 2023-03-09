from django.urls import path

from .views import (
    UserIndividualView,
    AllUsersView
)

urlpatterns = [
    path('<int:user_id>/', UserIndividualView.as_view()),
    path('all/',  AllUsersView.as_view()),
    # path('')
]
