import uuid

from drf_spectacular.utils import extend_schema_serializer
from rest_framework import serializers

from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "is_active",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "region",
            "role",
        ]
        read_only_fields = ["id", "email"]


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "rank", "description"]
        read_only_fields = ["id"]


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            "id",
            "city",
            "postal_code",
            "street",
            "house_number",
            "bus",
            "client_number",
            "duration",
            "syndic",
            "region",
            "name",
            "public_id",
        ]
        read_only_fields = ["id"]


class BuildingCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingComment
        fields = ["id", "comment", "date", "building"]
        read_only_fields = ["id"]


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = ["id", "name", "template"]
        read_only_fields = ["id"]


@extend_schema_serializer(exclude_fields=["verification_code"])
class LobbySerializer(serializers.ModelSerializer):
    class Meta:
        model = Lobby
        fields = ["id", "email", "verification_code", "role"]
        read_only_fields = ["id"]


class RemarkAtBuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RemarkAtBuilding
        fields = ["id", "building", "timestamp", "remark", "student_on_tour", "type"]
        read_only_fields = ["id"]


class PictureOfRemarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PictureOfRemark
        fields = ["id", "picture", "remark_at_building", "hash"]
        read_only_fields = ["id"]


class StudOnTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentOnTour
        fields = ["id", "tour", "date", "student", "started_tour", "completed_tour"]
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
        read_only_fields = ["id"]


class BuildingTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingOnTour
        fields = ["id", "building", "tour", "index"]
        read_only_fields = ["id"]


class TourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = ["id", "name", "region", "modified_at"]
        read_only_fields = ["id"]


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "region"]
        read_only_fields = ["id"]


class SuccessSerializer(serializers.Serializer):
    data = serializers.CharField(max_length=255)


class BuildingSwapRequestSerializer(serializers.Serializer):
    buildingID1 = serializers.IntegerField()

    buildingID2 = serializers.IntegerField()


class PublicIdSerializer(serializers.Serializer):
    public_id = serializers.UUIDField(format="hex")

    def create(self, validated_data):
        public_id = uuid.uuid4()
        return {"public_id": public_id}


class ProgressTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentOnTour
        fields = ('current_building_index', 'max_building_index')
