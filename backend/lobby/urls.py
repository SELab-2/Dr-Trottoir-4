from django.urls import path

from .views import (
    DefaultLobby,
    LobbyIndividualView,
    LobbyAllView,
    LobbyRefreshVerificationCodeView,
)

urlpatterns = [
    path("all/", LobbyAllView.as_view()),
    path("new-verification-code/<lobby_id>/", LobbyRefreshVerificationCodeView.as_view()),
    path("<int:email_whitelist_id>/", LobbyIndividualView.as_view()),
    path("", DefaultLobby.as_view()),
]
