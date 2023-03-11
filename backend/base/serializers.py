from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "phone_number", "region", "role"]

        read_only_fields = ["id", "email"]


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ["id", "city", "postal_code", "street", "house_number", "client_number",
                  "duration", "syndic", "region", "name"]
        read_only_fields = ["id"]

class PictureBuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PictureBuilding
        fields = ["building", "picture", "description", "timestamp", "type"]