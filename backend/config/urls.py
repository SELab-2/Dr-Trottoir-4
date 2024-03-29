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
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path, reverse_lazy
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from authentication import urls as authentication_urls
from building import urls as building_urls
from building_comment import urls as building_comment_urls
from building_on_tour import urls as building_on_tour_urls
from email_template import urls as email_template_urls
from garbage_collection import urls as garbage_collection_urls
from lobby import urls as email_whitelist_urls
from manual import urls as manual_urls
from picture_of_remark import urls as picture_of_remark_urls

# from picture_building import urls as picture_building_urls
from region import urls as region_urls
from remark_at_building import urls as remark_at_building_urls
from role import urls as role_urls
from student_on_tour import urls as stud_tour_urls
from tour import urls as tour_urls
from users import urls as user_urls
from .settings import MEDIA_URL, MEDIA_ROOT
from .views import RootDefault

urlpatterns = [
    path("", RootDefault.as_view()),
    path("analysis/", include("analysis.urls")),
    path("admin/", admin.site.urls),
    path("docs/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/ui/", SpectacularSwaggerView.as_view(url="/docs"), name="swagger-ui"),
    path("authentication/", include(authentication_urls)),
    path("manual/", include(manual_urls)),
    # path("picture-building/", include(picture_building_urls)),
    path("building/", include(building_urls)),
    path("building-comment/", include(building_comment_urls)),
    path("remark-at-building/", include(remark_at_building_urls)),
    path("picture-of-remark/", include(picture_of_remark_urls)),
    path("email-template/", include(email_template_urls)),
    path("lobby/", include(email_whitelist_urls)),
    path("region/", include(region_urls)),
    path("garbage-collection/", include(garbage_collection_urls)),
    path("building-on-tour/", include(building_on_tour_urls)),
    path("user/", include(user_urls)),
    path("role/", include(role_urls)),
    path("student-on-tour/", include(stud_tour_urls)),
    path("tour/", include(tour_urls)),
    re_path(r"^$", RedirectView.as_view(url=reverse_lazy("api"), permanent=False)),
] + static(MEDIA_URL, document_root=MEDIA_ROOT)
