from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url
from util.data_generators import createUser, insert_dummy_region


class TourTests(TestCase):
    def test_empty_tour_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/tour/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        data = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        resp = client.post(f"{backend_url}/tour/", data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        r_id = insert_dummy_region()
        data = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        _ = client.post(f"{backend_url}/tour/", data, follow=True)
        response = client.post(f"{backend_url}/tour/", data, follow=True)
        assert response.status_code == 400

    def test_get_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        r_id = insert_dummy_region()
        data = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        response1 = client.post(f"{backend_url}/tour/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/tour/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/tour/123456789", follow=True)
        assert resp.status_code == 400  # should be changed to 404

    def test_patch_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        r_id = insert_dummy_region()
        data1 = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        data2 = {
            "name": "Overpoort",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        response1 = client.post(f"{backend_url}/tour/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/tour/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/tour/{id}/", follow=True)
        for key in data2:
            # alle info zou er in moeten zitten
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        data = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        response2 = client.patch(f"{backend_url}/tour/123434687658/", data, follow=True)
        assert response2.status_code == 400

    def test_patch_error_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        data1 = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        data2 = {
            "name": "Overpoort",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        response1 = client.post(f"{backend_url}/tour/", data1, follow=True)
        _ = client.post(f"{backend_url}/tour/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/tour/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        data1 = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        response1 = client.post(f"{backend_url}/tour/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/tour/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/tour/{id}/", follow=True)
        # should be 404 I think
        # assert response3.status_code == 404
        assert response3.status_code == 400

    def test_remove_nonexistent_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/tour/123456789/", follow=True)
        assert response2.status_code == 400

    def test_add_existing_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        data1 = {
            "name": "Sterre",
            "region": r_id,
            "modified_at": "2023-03-08T12:08:29+01:00"
        }
        _ = client.post(f"{backend_url}/tour/", data1, follow=True)
        response1 = client.post(f"{backend_url}/tour/", data1, follow=True)
        assert response1.status_code == 400
