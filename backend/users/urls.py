from dj_rest_auth.registration.views import VerifyEmailView
from dj_rest_auth.views import PasswordResetView, PasswordResetConfirmView
from django.urls import path, include

urlpatterns = [
    path('', include('dj_rest_auth.urls')),
    path('signup/', include("dj_rest_auth.registration.urls")),
    path('verify-email/', VerifyEmailView.as_view(), name="rest_verify_email"),
    path(
        'account-confirm-email/',
        VerifyEmailView.as_view(),
        name='account_confirm_email_sent',
    ),
    path(
        "account-confirm-email/<key>/",
        VerifyEmailView.as_view(),
        name='account_confirm_email',
    ),
    path('password-reset/', PasswordResetView.as_view()),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
