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

class StudBuildTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAtBuildingOnTour
        fields = ["id", "building_on_tour", "date", "student"]