from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url
from util.data_generators import createUser


def get_authenticated_client():
    user = createUser()
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class BaseTest(TestCase):
    data1 = None
    data2 = None

    def setUp(self):
        self.client = get_authenticated_client()

    def empty_list(self, url):
        resp = self.client.get(backend_url + "/" + url, follow=True)
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

    def add_dupe(self, url):
        _ = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        response1 = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        assert response1.status_code == 400
