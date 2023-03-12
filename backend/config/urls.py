"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path, reverse_lazy
from django.views.generic import RedirectView

from authentication import urls as authentication_urls
from building import urls as building_urls
from buildingurl import urls as building_url_urls
from garbage_collection import urls as garbage_collection_urls
from users import urls as user_urls
from tour import urls as tour_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('authentication/', include(authentication_urls)),
    path('building/', include(building_urls)),
    path('buildingurl/', include(building_url_urls)),
    path('garbage_collection/', include(garbage_collection_urls)),
    path('user/', include(user_urls)),
    path('tour/', include(tour_urls)),
    re_path(r'^$', RedirectView.as_view(url=reverse_lazy('api'), permanent=False)),
]
