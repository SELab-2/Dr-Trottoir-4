from rest_framework import serializers


class GarbageCollectionDuplicateRequestSerializer(serializers.Serializer):
    start_date_period = serializers.DateField(
        required=True,
        help_text="The start date of the period to copy. If this date would fall within a week, it would be "
        "translated to the monday of that week.",
    )
    end_date_period = serializers.DateField(
        required=True,
        help_text="The end date of the period to copy. If this date would fall within a week, it would be "
        "translated to the sunday of that week.",
    )
    start_date_copy = serializers.DateField(
        required=True,
        help_text="The start date to begin the copy. If this date would fall within a week, it would be "
        "translated to the monday of that week.",
    )
    building_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="A list of buildings for which you want to copy the garbage collection",
    )
