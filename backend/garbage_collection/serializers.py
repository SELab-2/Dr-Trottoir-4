from rest_framework import serializers

from util.duplication.serializer import DuplicationSerializer


class GarbageCollectionDuplicateRequestSerializer(DuplicationSerializer):
    building_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="A list of buildings for which you want to copy the garbage collection",
    )
