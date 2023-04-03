from django.urls import path

from picture_of_remark.views import Default

urlpatterns = [
    path("", Default.as_view())
]
