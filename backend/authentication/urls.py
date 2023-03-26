from dj_rest_auth.views import (
    PasswordResetView,
    PasswordResetConfirmView,
    PasswordChangeView,
)
from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework_simplejwt.serializers import TokenVerifySerializer

from authentication.views import (
    CustomLogoutView, CustomRegisterView, CustomLoginView, CustomTokenRefreshView, CustomTokenVerifyView,
    CustomPasswordChangeView,
)

urlpatterns = [
    # URLs that do not require a session or valid token
    path("signup/", CustomRegisterView.as_view()),
    path("password/reset/", PasswordResetView.as_view()),
    path(
        "password/reset/confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
    ),
    path("login/", CustomLoginView.as_view()),
    path("token/verify/", CustomTokenVerifyView.as_view()),
    path("token/refresh/", CustomTokenRefreshView.as_view()),
    # URLs that require a user to be logged in with a valid session / token.
    path("logout/", CustomLogoutView.as_view()),
    path("password/change/", CustomPasswordChangeView.as_view()),
]
