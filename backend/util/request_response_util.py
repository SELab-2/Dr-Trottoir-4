from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response


def bad_request(object_name="Object"):
    return Response(
        {"res", f"{object_name} with given ID does not exist."},
        status=status.HTTP_400_BAD_REQUEST
    )


def bad_request_relation(object1: str, object2: str):
    return Response(
        {"res", f"There is no {object1} that is linked to {object2} with given id."},
        status=status.HTTP_400_BAD_REQUEST
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
        error_message = str(e) + \
                        ". This error could be thrown after you passed an empty body with e.g. a POST request."
    except (IntegrityError, ObjectDoesNotExist, ValueError) as e:
        error_message = str(e)
    finally:
        if rm: model_instance.delete()
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


# Below functions are used to be able to change the status codes really quick if we would decide to use another one
def delete_succes():
    return Response(status=status.HTTP_204_NO_CONTENT)


def post_succes(serializer):
    return Response(serializer.data, status=status.HTTP_201_CREATED)


def get_succes(serializer):
    return Response(serializer.data, status=status.HTTP_200_OK)


def patch_succes(serializer):
    return get_succes(serializer)
