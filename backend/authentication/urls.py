from dj_rest_auth.views import (
    PasswordResetView,
    PasswordResetConfirmView,
    PasswordChangeView,
)
from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView

from authentication.views import (
    LoginViewWithHiddenTokens,
    RefreshViewHiddenTokens,
    CustomLogoutView, CustomRegisterView,
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
    path("login/", LoginViewWithHiddenTokens.as_view(), name="rest_login"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("token/refresh/", RefreshViewHiddenTokens.as_view(), name="token_refresh"),
    # URLs that require a user to be logged in with a valid session / token.
    path("logout/", CustomLogoutView.as_view(), name="rest_logout"),
    path("password/change/", PasswordChangeView.as_view(), name="rest_password_change"),
]
