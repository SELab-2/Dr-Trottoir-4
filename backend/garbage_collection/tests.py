from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url
from util.data_generators import createUser, insert_dummy_building


class GarbageCollectionTests(TestCase):
    def test_empty_garbage_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/garbage-collection/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }
        resp = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }

        _ = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        response = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        assert response.status_code == 400

    def test_get_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }

        response1 = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/garbage-collection/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/garbage-collection/123456789", follow=True)
        assert resp.status_code == 400  # should be changed to 404

    def test_patch_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        b_id = insert_dummy_building()
        data1 = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }
        data2 = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "PMD"
        }
        response1 = client.post(f"{backend_url}/garbage-collection/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/garbage-collection/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/garbage-collection/{id}/", follow=True)
        for key in data2:
            # alle info zou er in moeten zitten
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }
        response2 = client.patch(f"{backend_url}/garbage-collection/123434687658/", data, follow=True)
        assert response2.status_code == 400

    def test_patch_error_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data1 = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }
        data2 = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "PMD"
        }
        response1 = client.post(f"{backend_url}/garbage-collection/", data1, follow=True)
        _ = client.post(f"{backend_url}/garbage-collection/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/garbage-collection/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }

        response1 = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/garbage-collection/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/garbage-collection/{id}/", follow=True)
        # should be 404 I think
        # assert response3.status_code == 404
        assert response3.status_code == 400

    def test_remove_nonexistent_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/garbage-collection/123456789/", follow=True)
        assert response2.status_code == 400

    def test_add_existing_garbage(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "date": "2023-03-08",
            "garbage_type": "RES"
        }
        _ = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        response1 = client.post(f"{backend_url}/garbage-collection/", data, follow=True)
        assert response1.status_code == 400
