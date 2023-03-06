from dj_rest_auth.registration.views import VerifyEmailView
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
]
