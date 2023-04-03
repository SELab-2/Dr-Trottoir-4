from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url, roles
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
            "type": "AA",
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
            "type": "AA",
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
            "type": "AA",
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
            "type": "AA",
        }
        data2 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
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
            "type": "AA",
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
            "type": "AA",
        }
        data2 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
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
            "type": "AA",
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
            "type": "AA",
        }
        _ = client.post(f"{backend_url}/picture-building/", data, follow=True)
        response1 = client.post(f"{backend_url}/picture-building/", data, follow=True)
        # should be 201 because it's resolved internally
        assert response1.status_code == 201


class PictureAuthorizationTests(TestCase):

    def test_picture_list(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            resp = client.get(f"{backend_url}/picture-building/all")
            if role == "Student":
                print(resp.status_code)
                print(resp.data)
            assert resp.status_code == codes[role]

    def test_insert_picture(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 201,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)
        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
        }
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)

            resp = client.post(f"{backend_url}/picture-building/", data, follow=True)
            assert resp.status_code == codes[role]
            if resp.status_code == 201:
                id = resp.data["id"]
                adminClient.delete(f"{backend_url}/picture-building/{id}/", follow=True)

    def test_get_picture(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 200,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building()
        data = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
        }

        response1 = adminClient.post(f"{backend_url}/picture-building/", data, follow=True)

        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(f"{backend_url}/picture-building/{id}/", follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]

    def test_patch_picture(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 200,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building()
        data1 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
        }
        data2 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
        }

        response1 = adminClient.post(f"{backend_url}/picture-building/", data1, follow=True)
        id = response1.data["id"]
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.patch(f"{backend_url}/picture-building/{id}/", data2, follow=True)
            assert response2.status_code == codes[role]

    def test_remove_picture(self):
        codes = {
            "Default": 403,
            "Admin": 204,
            "Superstudent": 204,
            "Student": 204,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building()
        data1 = {
            "building": b_id,
            "picture": f,
            "description": "kinda noisy",
            "timestamp": "2023-03-08T12:08:29+01:00",
            "type": "AA",
        }
        exists = False
        for role in roles:
            if not exists:
                # building toevoegen als admin
                response1 = adminClient.post(f"{backend_url}/picture-building/", data1, follow=True)
                id = response1.data["id"]
            # proberen verwijderen als `role`
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.delete(f"{backend_url}/picture-building/{id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
