from dj_rest_auth.views import (
    PasswordResetView,
    PasswordResetConfirmView,
)
from django.urls import path

from authentication.views import (
    CustomLoginView,
    CustomTokenVerifyView,
    CustomTokenRefreshView,
    CustomLogoutView,
    CustomPasswordChangeView,
    CustomSignUpView,
)

urlpatterns = [
    # URLs that do not require a session or valid token
    path("signup/", CustomSignUpView.as_view()),
    path("password/reset/", PasswordResetView.as_view(), name="password_reset"),
    path("password/reset/confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("login/", CustomLoginView.as_view()),
    path("token/verify/", CustomTokenVerifyView.as_view()),
    path("token/refresh/", CustomTokenRefreshView.as_view()),
    # URLs that require a user to be logged in with a valid session / token.
    path("logout/", CustomLogoutView.as_view()),
    path("password/change/", CustomPasswordChangeView.as_view()),
]
