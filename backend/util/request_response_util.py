from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response


def set_keys_of_instance(instance, data: dict, translation: dict = {}):
    for key in translation.keys():
        if key in data:
            data[translation[key]] = data[key]

    for key in data.keys():
        if key in vars(instance):
            setattr(instance, key, data[key])

    return instance


def bad_request(object_name="Object"):
    return Response(
        {"res", f"{object_name} with given ID does not exist."},
        status=status.HTTP_400_BAD_REQUEST,
    )


def bad_request_relation(object1: str, object2: str):
    return Response(
        {"res", f"There is no {object1} that is linked to {object2} with given id."},
        status=status.HTTP_400_BAD_REQUEST,
    )


def try_full_clean_and_save(model_instance, rm=False):
    error_message = None
    try:
        model_instance.full_clean()
        model_instance.save()
    except ValidationError as e:
        error_message = e.message_dict
    except AttributeError as e:
        # If body is empty, an attribute error is thrown in the clean function
        #  if there is not checked whether the fields in self are intialized
        error_message = str(e) + ". This error could be thrown after you passed an empty body with e.g. a POST request."
    except (IntegrityError, ObjectDoesNotExist, ValueError) as e:
        error_message = str(e)
    finally:
        if rm:
            model_instance.delete()
        if error_message:
            return Response(error_message, status=status.HTTP_400_BAD_REQUEST)
    return None


def request_to_dict(request_data):
    if request_data:
        out = request_data
        if hasattr(request_data, "dict"):
            out = out.dict()
        return out
    return {}


def delete_success():
    return Response(status=status.HTTP_204_NO_CONTENT)


def post_success(serializer):
    return Response(serializer.data, status=status.HTTP_201_CREATED)


def get_success(serializer):
    return Response(serializer.data, status=status.HTTP_200_OK)


def patch_success(serializer):
    return get_success(serializer)
