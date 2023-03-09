from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["id", "username", "email", "firstname", "lastname",
                  "phone_number", "region", "role"]


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ["id", "city", "postal_code", "street", "house_number", "client_number",
                  "duration", "syndic", "region", "name"]
