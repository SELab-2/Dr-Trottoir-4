from rest_framework.test import APIClient

from util.data_generators import createUser


def get_authenticated_client():
    user = createUser()
    client = APIClient()
    client.force_authenticate(user=user)
    return client
