from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url
from util.data_generators import createUser, insert_dummy_building, createMemoryFile

f = createMemoryFile("backend/picture_building/scrambled1.png")


class PictureTests(TestCase):
    def test_empty_picture_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/picture-building/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        resp = client.post(f"{backend_url}/picture-building/", data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }

        r1 = client.post(f"{backend_url}/picture-building/", data, follow=True)
        print(r1.data)
        response = client.post(f"{backend_url}/picture-building/", data, follow=True)
        print(response.data)
        # picture names are automatically unique
        assert response.status_code == 201

    def test_get_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }

        response1 = client.post(f"{backend_url}/picture-building/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/picture-building/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/picture-building/123456789", follow=True)
        assert resp.status_code == 404

    def test_patch_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        b_id = insert_dummy_building()
        data1 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        data2 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        response1 = client.post(f"{backend_url}/picture-building/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/picture-building/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/picture-building/{id}/", follow=True)
        for key in data2:
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        response2 = client.patch(f"{backend_url}/picture-building/123434687658/", data, follow=True)
        assert response2.status_code == 404

    def test_patch_error_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data1 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        data2 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        response1 = client.post(f"{backend_url}/picture-building/", data1, follow=True)
        _ = client.post(f"{backend_url}/picture-building/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/picture-building/{id}/", data2, follow=True)
        # 200 because it should be resolved automatically
        assert response2.status_code == 200

    def test_remove_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }

        response1 = client.post(f"{backend_url}/picture-building/", data, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/picture-building/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/picture-building/{id}/", follow=True)
        assert response3.status_code == 404

    def test_remove_nonexistent_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/picture-building/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_picture(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA"
        }
        _ = client.post(f"{backend_url}/picture-building/", data, follow=True)
        response1 = client.post(f"{backend_url}/picture-building/", data, follow=True)
        # should be 201 because it's resolved internally
        assert response1.status_code == 201
