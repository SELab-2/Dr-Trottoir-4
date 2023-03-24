from dj_rest_auth.registration.serializers import RegisterSerializer

from base.models import User
from util.request_response_util import request_to_dict


class CustomRegisterSerializer(RegisterSerializer):

    def custom_signup(self, request, user: User):
        data = request_to_dict(request.data)
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.phone_number = data.get('phone_number')
        user.role_id = data.get('role')
        region = data.get('region')
        if region:
            # TODO: change this to the same util function as used in user view
            user.region = data.get('region')
        user.save()
