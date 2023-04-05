from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User
from base.test_settings import backend_url, roles
from util.data_generators import createUser


def get_authenticated_client(role="admin"):
    user = createUser(role)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class BaseTest(TestCase):
    data1 = None
    data2 = None

    def setUp(self):
        self.client = get_authenticated_client()

    def empty_list(self, url):
        resp = self.client.get(backend_url + "/" + url + "all/", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def insert(self, url):
        resp = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        assert resp.status_code == 201
        for key in self.data1:
            assert key in resp.data
        assert "id" in resp.data

    def insert_dupe(self, url):
        _ = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        response = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        assert response.status_code == 400

    def get(self, url, data):
        response2 = self.client.get(backend_url + "/" + url, follow=True)
        assert response2.status_code == 200
        for key in data:
            # all data should be present
            assert key in response2.data
        # an ID should be present
        assert "id" in response2.data

    def get_non_existent(self, url):
        resp = self.client.get(backend_url + "/" + url + "1234567", follow=True)
        assert resp.status_code == 404

    def patch(self, url):
        response2 = self.client.patch(backend_url + "/" + url, self.data1, follow=True)
        assert response2.status_code == 200
        response3 = self.client.get(backend_url + "/" + url, follow=True)
        for key in self.data1:
            # all data should be present
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def patch_invalid(self, url):
        response2 = self.client.patch(backend_url + "/" + url + "123434687658/", self.data1, follow=True)
        assert response2.status_code == 404

    def patch_error(self, url):
        response1 = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        _ = self.client.post(backend_url + "/" + url, self.data2, follow=True)
        assert response1.status_code == 201
        result_id = response1.data["id"]
        response2 = self.client.patch(backend_url + "/" + url + f"{result_id}/", self.data2, follow=True)
        assert response2.status_code == 400

    def remove(self, url):
        response2 = self.client.delete(backend_url + "/" + url, follow=True)
        assert response2.status_code == 204
        response3 = self.client.get(backend_url + "/" + url, follow=True)
        assert response3.status_code == 404

    def remove_invalid(self, url):
        response2 = self.client.delete(backend_url + "/" + url + "123434687658", follow=True)
        print(response2.status_code)
        print(response2.data)
        assert response2.status_code == 404


class BaseAuthTest(TestCase):
    data1 = None

    def list_view(self, url, codes):
        for role in roles:
            client = get_authenticated_client(role)
            resp = client.get(backend_url + "/" + url + "all/")
            assert resp.status_code == codes[role]

    def insert_view(self, url, codes):
        adminClient = get_authenticated_client()
        for role in roles:
            client = get_authenticated_client(role)
            resp = client.post(backend_url + "/" + url, self.data1, follow=True)
            assert resp.status_code == codes[role]
            if resp.status_code == 201:
                print(resp.data)
                result_id = resp.data["id"]
                _ = adminClient.delete(backend_url + "/" + url + str(result_id))

    def get_view(self, url, codes, special=[]):
        for role in roles:
            client = get_authenticated_client(role)
            response2 = client.get(backend_url + "/" + url, follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]
        for user_id, result in special:
            user = User.objects.filter(id=user_id).first()  # there should only be 1
            if not User:
                raise ValueError("user not valid")
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(backend_url + "/" + url, follow=True)
            assert response2.status_code == result

    def patch_view(self, url, codes, special=[]):
        for role in roles:
            client = get_authenticated_client(role)
            response2 = client.patch(backend_url + "/" + url, self.data1, follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]
        for user_id, result in special:
            user = User.objects.filter(id=user_id).first()  # there should only be 1
            if not User:
                raise ValueError("user not valid")
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.patch(backend_url + "/" + url, self.data1, follow=True)
            if response2.status_code != result:
                print(f"failed special case for user with role {user.role.name}\t got {response2.status_code} (expected {result})")
            assert response2.status_code == result

    def remove_view(self, url, codes, create):
        exists = False
        instance_id = -1
        for role in roles:
            if not exists:
                instance_id = create()
            # try to remove as `role`
            client = get_authenticated_client(role)
            response2 = client.delete(backend_url + "/" + url + f"{instance_id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
