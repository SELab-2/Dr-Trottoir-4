from rest_framework import serializers
from .models import *


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ["city", "postal_code", "street", "house_number", "client_number",
                  "duration", "syndic", "region", "name"]
