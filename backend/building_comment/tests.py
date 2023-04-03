from django.test import TestCase
from rest_framework.test import APIClient

from base.models import Building
from base.test_settings import backend_url, roles
from util.data_generators import createUser, insert_dummy_building


class BuildingCommentTests(TestCase):
    def test_empty_comment_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/building-comment/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        resp = client.post(f"{backend_url}/building-comment/", data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        b_id = insert_dummy_building()
        data = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}

        _ = client.post(f"{backend_url}/building-comment/", data, follow=True)
        response = client.post(f"{backend_url}/building-comment/", data, follow=True)
        assert response.status_code == 400

    def test_get_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        b_id = insert_dummy_building()
        data = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}

        response1 = client.post(f"{backend_url}/building-comment/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # all the data should be present
            assert key in response1.data
        # ID should be returned
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/building-comment/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # all the data should be present
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/building-comment/123456789", follow=True)
        assert resp.status_code == 404

    def test_patch_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        b_id = insert_dummy_building()
        data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        data2 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        response1 = client.post(f"{backend_url}/building-comment/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/building-comment/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/building-comment/{id}/", follow=True)
        for key in data2:
            # all data should be present
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        response2 = client.patch(f"{backend_url}/building-comment/123434687658/", data, follow=True)
        assert response2.status_code == 404

    def test_patch_error_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        data2 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        response1 = client.post(f"{backend_url}/building-comment/", data1, follow=True)
        _ = client.post(f"{backend_url}/building-comment/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/building-comment/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        response1 = client.post(f"{backend_url}/building-comment/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/building-comment/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/building-comment/{id}/", follow=True)
        assert response3.status_code == 404

    def test_remove_nonexistent_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/building-comment/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building()
        data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        _ = client.post(f"{backend_url}/building-comment/", data1, follow=True)
        response1 = client.post(f"{backend_url}/building-comment/", data1, follow=True)
        assert response1.status_code == 400


class AuthorizationTests(TestCase):
    def test_building_comment_list(self):
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
            resp = client.get(f"{backend_url}/building-comment/all")
            assert resp.status_code == codes[role]

    def test_insert_building_comment(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 403,
            "Syndic": 403
        }
        number = 1
        b_id = insert_dummy_building()
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            data = {"comment": f"<3 python - {number}", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
            number += 1
            resp = client.post(f"{backend_url}/building-comment/", data, follow=True)
            assert resp.status_code == codes[role]

    def test_get_building_comment(self):
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
        data = {"comment": f"<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}

        response1 = adminClient.post(f"{backend_url}/building-comment/", data, follow=True)
        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(f"{backend_url}/building-comment/{id}/", follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]
        # testing special case when syndic is owner of building
        building = Building.objects.filter(id=b_id)[0]  # there should only be 1
        user = building.syndic
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.get(f"{backend_url}/building-comment/{id}/", follow=True)
        assert response2.status_code == 200

    def test_patch_building_comment(self):
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
        b_id = insert_dummy_building()
        data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        data2 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}

        response1 = adminClient.post(f"{backend_url}/building-comment/", data1, follow=True)
        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.patch(f"{backend_url}/building-comment/{id}/", data2, follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]
        # testing special case when syndic is owner of building
        # patch shouldn't be allowed either way
        building = Building.objects.filter(id=b_id)[0]  # there should only be 1
        user = building.syndic
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.patch(f"{backend_url}/building-comment/{id}/", data2, follow=True)
        print(response2.data)
        print(response2.status_code)
        if response2.status_code != codes[role]:
            print(f"role: owner\tcode: {response2.status_code} (expected {codes[role]})")
        assert response2.status_code == 200

    def test_remove_building_comment(self):
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
        b_id = insert_dummy_building()
        data = {"comment": f"<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}

        exists = False
        for role in roles:
            if not exists:
                # building toevoegen als admin
                response1 = adminClient.post(f"{backend_url}/building-comment/", data, follow=True)
                id = response1.data["id"]
            # proberen verwijderen als `role`
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.delete(f"{backend_url}/building-comment/{id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
