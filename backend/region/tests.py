from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url
from util.data_generators import createUser


class RegionTests(TestCase):
    def test_empty_region_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(f"{backend_url}/region/all", follow=True)
        assert response.status_code == 200
        data = [response.data[e] for e in response.data]
        assert len(data) == 0

    def test_insert_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {
            "region": "Gent"
        }
        response = client.post(f"{backend_url}/region/", data, follow=True)
        assert response.status_code == 201
        for key in data:
            assert key in response.data
        assert "id" in response.data

    def test_insert_dupe_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {
            "region": "Gent"
        }
        _ = client.post(f"{backend_url}/region/", data, follow=True)
        response = client.post(f"{backend_url}/region/", data, follow=True)
        assert response.status_code == 400

    def test_get_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/region/{id}/", follow=True)
        assert response2.status_code == 200
        assert response2.data["region"] == "Gent"
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response1 = client.get(f"{backend_url}/region/123654897", follow=True)
        assert response1.status_code == 404

    def test_patch_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Brugge"
        }
        data2 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/region/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/region/{id}/", follow=True)
        assert response3.status_code == 200
        assert response3.data["region"] == "Gent"
        assert "id" in response3.data

    def test_patch_invalid_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {
            "region": "Brugge"
        }
        response2 = client.patch(f"{backend_url}/region/123434687658/", data, follow=True)
        assert response2.status_code == 404

    def test_patch_error_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Brugge"
        }
        data2 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        _ = client.post(f"{backend_url}/region/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/region/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/region/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/region/{id}/", follow=True)
        assert response3.status_code == 404

    def test_remove_non_existent_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/region/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Gent"
        }
        _ = client.post(f"{backend_url}/region/", data1, follow=True)
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 400
