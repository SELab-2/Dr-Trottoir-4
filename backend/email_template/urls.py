from django.urls import path

from .views import (
    DefaultEmailTemplate,
    EmailTemplateIndividualView,
    EmailTemplateAllView
)

urlpatterns = [
    path("all/", EmailTemplateAllView.as_view()),
    path("<email_template_id>/", EmailTemplateIndividualView.as_view()),
    path("", DefaultEmailTemplate.as_view())
]
