"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path, path

from config import consumers

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = ProtocolTypeRouter(
    {
        # Django's ASGI application to handle traditional HTTP requests
        "http": get_asgi_application(),
        # WebSocket handler
        "websocket": URLRouter(
            [
                re_path(
                    r"^ws/student-on-tour/(?P<student_on_tour_id>\d+)/$",
                    consumers.IndividualStudentOnTourConsumer.as_asgi(),
                ),
                path("ws/student-on-tour/all/", consumers.AllStudentOnTourConsumer.as_asgi()),
            ]
        ),
    }
)
