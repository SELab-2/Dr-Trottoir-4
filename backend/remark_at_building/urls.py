from django.urls import path

from remark_at_building.views import Default

urlpatterns = [
    path("", Default.as_view())
]
