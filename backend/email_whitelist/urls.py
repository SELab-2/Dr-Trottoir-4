from django.urls import path

from .views import (
    DefaultEmailWhiteList,
    EmailWhiteListIndividualView,
    EmailWhiteListAllView,
    EmailWhiteListNewVerificationCode,
)

urlpatterns = [
    path("all/", EmailWhiteListAllView.as_view()),
    path("new_verification_code/<email_whitelist_id>/", EmailWhiteListNewVerificationCode.as_view()),
    path("<email_whitelist_id>/", EmailWhiteListIndividualView.as_view()),
    path("", DefaultEmailWhiteList.as_view()),
]
