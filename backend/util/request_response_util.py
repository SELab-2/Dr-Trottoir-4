import uuid
from datetime import datetime
from typing import Callable

from django.core.exceptions import ValidationError, BadRequest
from drf_spectacular.utils import OpenApiParameter
from rest_framework import status
from rest_framework.response import Response


def get_id_param(request, name, required=False):
    param = request.GET.get(name, None)
    if param:
        if not param.isdigit():
            raise BadRequest(f"The query parameter {name} should be an integer")
    else:
        if required:
            raise BadRequest(f"The query parameter {name} is required")
    return param


def get_date_param(request, name, required=False):
    param = request.GET.get(name, None)
    if param:
        try:
            param = datetime.strptime(param, "%Y-%m-%d")
        except ValueError:
            raise BadRequest(f"The date parameter '{name}': '{param}' hasn't the appropriate form (=YYYY-MM-DD).")
    else:
        if required:
            raise BadRequest(f"The query parameter {name} is required")
    return param


def get_boolean_param(request, name, required=False):
    param = request.GET.get(name, None)
    if param is None:
        if required:
            raise BadRequest(f'The query parameter {name} is required')
        else:
            return None
    elif param.lower() == 'true':
        return True
    elif param.lower() == 'false':
        return False
    else:
        raise BadRequest(f"Invalid value for boolean parameter '{name}': '{param}' (true or false expected)")


def get_list_param(request, name, required=False):
    param = request.GET.getlist(name)
    if not param:
        if required:
            raise BadRequest(f'The query parameter {name} is required')
        else:
            return None
    return param


def get_param(request, key, required):
    if "date" in key:
        return get_date_param(request, key, required)
    elif "list" in key:
        param_list = get_list_param(request, key, required)
        if param_list and 'id' in key:
            return list(map(int, param_list))
        return param_list
    elif "id" in key:
        return get_id_param(request, key, required)
    elif "bool" in key:
        return get_boolean_param(request, key, required)
    # add more conditions here as needed
    else:
        return None


def get_filter_object(filter_key: str, required=False, exclude=False) -> dict:
    return {
        "filter_key": filter_key,
        "required": required,
        "exclude": exclude
    }


def filter_instances(request, instances, filters, query_param_value_transformation=lambda k, v: v):
    for key, filter_object in filters.items():
        param_value = get_param(request, key, filter_object["required"])
        param_value = query_param_value_transformation(key, param_value)
        if param_value is not None:
            if filter_object["exclude"]:
                instances = instances.exclude(**{filter_object["filter_key"]: param_value})
            else:
                instances = instances.filter(**{filter_object["filter_key"]: param_value})
    return instances


def get_unique_uuid(lookup_func: Callable[[str], bool] = None):
    # https://docs.python.org/3/library/uuid.html
    out_id = uuid.uuid4().hex

    # Normally it should never happen that the generated `id` is not unique,
    #  but just to be theoretically sure, you can pass a function that checks if the uuid is already in the database
    while lookup_func and lookup_func(out_id):
        out_id = uuid.uuid4().hex
    return out_id


def set_keys_of_instance(instance, data: dict, translation: dict = {}):
    for key in translation.keys():
        if key in data:
            data[translation[key]] = data[key]

    for key in data.keys():
        if key in vars(instance):
            setattr(instance, key, data[key])

    return instance


def not_found(object_name="Object"):
    return Response({"message": f"{object_name} was not found"}, status=status.HTTP_404_NOT_FOUND)


def bad_request(object_name="Object"):
    return Response({"message": f"bad input for {object_name}"}, status=status.HTTP_400_BAD_REQUEST)


def bad_request_relation(object1: str, object2: str):
    return Response(
        {"message": f"There is no {object1} that is linked to {object2} with given id."},
        status=status.HTTP_400_BAD_REQUEST,
    )


def try_full_clean_and_save(model_instance, rm=False):
    error_message = None
    try:
        model_instance.full_clean()
        model_instance.save()
    except ValidationError as e:
        error_message = e.message_dict
    except Exception as e:
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


def post_docs(serializer):
    return {201: serializer, 400: None}


def delete_docs():
    return {204: None, 400: None}


def get_docs(serializer):
    return {200: serializer, 400: None}


def patch_docs(serializer):
    return get_docs(serializer)


def param_docs(values):
    """
    values (dict) : this a dictionary with the name of a parameter as its key and the triplet
    (description, required, type) as value
    """
    docs = []
    for name, value in values.items():
        docs.append(OpenApiParameter(name=name, description=value[0], required=value[1], type=value[2]))
    return docs
