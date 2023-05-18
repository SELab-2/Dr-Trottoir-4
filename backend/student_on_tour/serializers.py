from rest_framework import serializers

from util.duplication.serializer import DuplicationSerializer


class StudentOnTourDuplicateSerializer(DuplicationSerializer):
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="A list of students for which you want to copy the student on tour",
    )
