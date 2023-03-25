from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response


def try_adding_region_to_user_instance(user_instance, region_value):
    try:
        user_instance.region.add(region_value)
    except IntegrityError as e:
        return Response(str(e.__cause__), status=status.HTTP_400_BAD_REQUEST)


def add_regions_to_user(user_instance, regions_raw):
    if not regions_raw:
        return

    try:
        regions = list(map(lambda x: int(x), regions_raw.strip("][").split(",")))
        if not type(regions) == list:
            raise SyntaxError()

    except (SyntaxError, ValueError):
        return Response({"message": "Invalid syntax. Regions must be a list of id's"},
                        status=status.HTTP_400_BAD_REQUEST)

    for region in regions:
        if r := try_adding_region_to_user_instance(user_instance, region):
            return r
