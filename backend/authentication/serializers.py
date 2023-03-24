from dj_rest_auth.registration.serializers import RegisterSerializer
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.serializers import CharField, IntegerField

from base.models import User
from util.request_response_util import request_to_dict


class CustomRegisterSerializer(RegisterSerializer):
    first_name = CharField(required=True)
    last_name = CharField(required=True)
    phone_number = PhoneNumberField(required=True)
    role = IntegerField(required=True)

    def custom_signup(self, request, user: User):
        data = request_to_dict(request.data)

        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.phone_number = data['phone_number']
        user.role_id = data['role']
