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
)

urlpatterns = [
    # URLs that do not require a session or valid token
    path("signup/", CustomRegisterView.as_view()),
    path("password/reset/", PasswordResetView.as_view()),
    path(
        "password/reset/confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("login/", CustomLoginView.as_view()),
    path("token/verify/", CustomTokenVerifyView.as_view()),
    path("token/refresh/", CustomTokenRefreshView.as_view()),
    # URLs that require a user to be logged in with a valid session / token.
    path("logout/", CustomLogoutView.as_view(), name="rest_logout"),
    path("password/change/", PasswordChangeView.as_view(), name="rest_password_change"),
]
