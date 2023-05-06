from datetime import timedelta
from typing import List

from rest_framework import serializers

from base.models import StudentOnTour


def validate_student_on_tours(student_on_tours):
    # raise an error if the student_on_tours queryset is not provided
    if student_on_tours is None:
        raise serializers.ValidationError('student_on_tours must be provided to serialize data')

    return student_on_tours


class WorkedHoursAnalysisSerializer(serializers.BaseSerializer):
    def to_representation(self, student_on_tours: List[StudentOnTour]):
        # create an empty dictionary to store worked hours data for each student
        student_data = {}

        # iterate over the list of student_on_tours objects
        for sot in student_on_tours:
            # get the student id for the current StudentOnTour object
            student_id = sot.student.id

            # calculate the worked hours for the current StudentOnTour object
            if sot.completed_tour and sot.started_tour:
                worked_time = sot.completed_tour - sot.started_tour
            else:
                worked_time = timedelta()

            # convert the worked hours to minutes
            worked_minutes = int(worked_time.total_seconds() // 60)

            # if we've seen this student before, update their worked hours and student_on_tour_ids
            if student_id in student_data:
                student_data[student_id]['worked_minutes'] += worked_minutes
                student_data[student_id]['student_on_tour_ids'].append(sot.id)
            # otherwise, add a new entry for this student
            else:
                student_data[student_id] = {
                    'student_id': student_id,
                    'worked_minutes': worked_minutes,
                    'student_on_tour_ids': [sot.id],
                }

        # return the list of student data dictionaries
        return list(student_data.values())
