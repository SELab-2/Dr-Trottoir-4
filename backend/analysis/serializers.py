from datetime import timedelta, datetime
from typing import List

from rest_framework import serializers

from base.models import StudentOnTour, RemarkAtBuilding


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


class StudentOnTourAnalysisSerializer(serializers.BaseSerializer):
    def to_representation(self, remarks_at_buildings: List[RemarkAtBuilding]):
        building_data = {}

        for rab in remarks_at_buildings:
            # get the building id for the current RemarkAtBuilding object
            building_id = rab.building.id
            # add a dict if we haven't seen this building before
            if building_id not in building_data:
                # Convert the TimeField to a datetime object with today's date
                today = datetime.today()
                transformed_datetime = datetime.combine(today, rab.building.duration)
                expected_duration_in_seconds = transformed_datetime.time().second + (
                            transformed_datetime.time().minute * 60) + (
                                                       transformed_datetime.time().hour * 3600)
                building_data[building_id] = {
                    'building_id': building_id,
                    'expected_duration_in_seconds': expected_duration_in_seconds,
                }

            if rab.type == 'AA':
                building_data[building_id]['arrival_time'] = rab.timestamp
            elif rab.type == 'VE':
                building_data[building_id]['departure_time'] = rab.timestamp

        for building_id, building_info in building_data.items():
            # calculate the duration of the visit
            if 'arrival_time' in building_info and 'departure_time' in building_info:
                duration = building_info['departure_time'] - building_info['arrival_time']
                # add the duration in seconds to the building info
                building_info['duration_in_seconds'] = round(duration.total_seconds())

        # return the list of building data dictionaries
        return list(building_data.values())
