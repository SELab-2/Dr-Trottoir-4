from django.urls import path

from picture_of_remark.views import *

urlpatterns = [
    path("<int:picture_of_remark>/", PictureOfRemarkIndividualView.as_view()),
    path("all/", AllPictureOfRemark.as_view()),
    path("remark/<int:remark_id>", PicturesOfRemarkView.as_view()),
    path("", Default.as_view()),
]
