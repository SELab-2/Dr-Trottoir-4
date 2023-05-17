from rest_framework import serializers


class DuplicationSerializer(serializers.Serializer):
    start_date_period = serializers.DateField(
        required=True,
        help_text="The start date of the period to copy. If this date would fall within a week, it would be "
        "translated to the corresponding day of that week (depending on the model being duplicated).",
    )
    end_date_period = serializers.DateField(
        required=True,
        help_text="The end date of the period to copy. If this date would fall within a week, it would be "
        "translated to the corresponding day of that week (depending on the model being duplicated).",
    )
    start_date_copy = serializers.DateField(
        required=True,
        help_text="The start date to begin the copy. If this date would fall within a week, it would be "
        "translated to the corresponding day of that week (depending on the model being duplicated).",
    )
