from rest_framework import serializers


from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name",
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
        fields = ["id", "building", "picture", "description", "timestamp", "type"]


class StudBuildTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAtBuildingOnTour
        fields = ["id", "building_on_tour", "date", "student"]


class BuildingUrlSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingURL
        fields = ["id", "first_name_resident", "last_name_resident", "building"]
        read_only_fields = ["id"]


class GarbageCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GarbageCollection
        fields = ["id", "building", "date", "garbage_type"]
        read_only_fields = ["id"]


class ManualSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manual
        fields = ["id", "building", "version_number", "file"]


class BuildingTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingOnTour
        fields = ["id", "building", "tour", "index"]


class TourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = ["id", "name", "region", "modified_at"]


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "region"]

