from django.urls import path

from .views import (
    RoleIndividualView,
    AllRolesView,
    DefaultRoleView
)


urlpatterns = [
    path('<int:role_id>/', RoleIndividualView.as_view()),
    path('all/', AllRolesView.as_view()),
    path('', DefaultRoleView.as_view())
]
