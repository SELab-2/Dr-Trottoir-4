from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url, roles
from util.data_generators import createUser


class RoleTests(TestCase):
    def test_role_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(f"{backend_url}/role/all", follow=True)
        assert response.status_code == 200
        data = [dict(e) for e in response.data]
        # length should be 1 since there is an Admin user present
        assert len(data) == 1

    def test_insert_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {"name": "Test", "rank": 2, "description": "testRole"}
        response = client.post(f"{backend_url}/role/", data, follow=True)
        print(response.data)
        assert response.status_code == 201
        for key in data:
            assert key in response.data
        assert "id" in response.data

    def test_insert_dupe_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {"name": "Test", "rank": 2, "description": "testRole"}
        _ = client.post(f"{backend_url}/role/", data, follow=True)
        response = client.post(f"{backend_url}/role/", data, follow=True)
        assert response.status_code == 400

    def test_get_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        response1 = client.post(f"{backend_url}/role/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/role/{id}/", follow=True)
        assert response2.status_code == 200
        assert response2.data["name"] == "Test"
        assert response2.data["description"] == "testRole"
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response1 = client.get(f"{backend_url}/role/123654897", follow=True)
        assert response1.status_code == 404

    def test_patch_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        data2 = {"name": "Test", "rank": 3, "description": "testRole"}
        response1 = client.post(f"{backend_url}/role/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/role/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/role/{id}/", follow=True)
        assert response3.status_code == 200
        assert response3.data["rank"] == 3
        assert "id" in response3.data

    def test_patch_invalid_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {"name": "Test", "rank": 2, "description": "testRole"}
        response2 = client.patch(f"{backend_url}/role/123434687658/", data, follow=True)
        assert response2.status_code == 404

    def test_patch_error_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        data2 = {"name": "Test2", "rank": 2, "description": "testRole"}
        response1 = client.post(f"{backend_url}/role/", data1, follow=True)
        _ = client.post(f"{backend_url}/role/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/role/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        response1 = client.post(f"{backend_url}/role/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/role/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/role/{id}/", follow=True)
        assert response3.status_code == 404

    def test_remove_non_existent_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/role/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_role(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        _ = client.post(f"{backend_url}/role/", data1, follow=True)
        response1 = client.post(f"{backend_url}/role/", data1, follow=True)
        assert response1.status_code == 400


class RoleAuthorizationTests(TestCase):

    def test_role_list(self):
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
            resp = client.get(f"{backend_url}/role/all")
            assert resp.status_code == codes[role]

    def test_insert_role(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 403,
            "Student": 403,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        data = {"name": "Test", "rank": 2, "description": "testRole"}

        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)

            resp = client.post(f"{backend_url}/role/", data, follow=True)
            assert resp.status_code == codes[role]
            if resp.status_code == 201:
                id = resp.data["id"]
                adminClient.delete(f"{backend_url}/role/{id}/", follow=True)

    def test_get_role(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        data = {"name": "Test", "rank": 2, "description": "testRole"}

        response1 = adminClient.post(f"{backend_url}/role/", data, follow=True)

        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(f"{backend_url}/role/{id}/", follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]

    def test_patch_role(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        data2 = {"name": "Test2", "rank": 2, "description": "testRole"}

        response1 = adminClient.post(f"{backend_url}/role/", data1, follow=True)
        id = response1.data["id"]
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.patch(f"{backend_url}/role/{id}/", data2, follow=True)
            assert response2.status_code == codes[role]

    def test_remove_role(self):
        codes = {
            "Default": 403,
            "Admin": 204,
            "Superstudent": 204,
            "Student": 403,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        data1 = {"name": "Test", "rank": 2, "description": "testRole"}

        exists = False
        for role in roles:
            if not exists:
                # building toevoegen als admin
                response1 = adminClient.post(f"{backend_url}/role/", data1, follow=True)
                id = response1.data["id"]
            # proberen verwijderen als `role`
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.delete(f"{backend_url}/role/{id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
