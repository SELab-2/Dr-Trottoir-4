from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User
from base.test_settings import backend_url, roles
from util.data_generators import createUser, insert_dummy_region, insert_dummy_syndic


class BuildingTests(TestCase):
    def test_empty_building_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/building/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        resp = client.post(f"{backend_url}/building/", data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }

        _ = client.post(f"{backend_url}/building/", data, follow=True)
        response = client.post(f"{backend_url}/building/", data, follow=True)
        assert response.status_code == 400

    def test_get_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }

        response1 = client.post(f"{backend_url}/building/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # all data should be present
            assert key in response1.data
        # there should be an ID as well
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/building/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # all data should be present
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/building/123456789", follow=True)
        assert resp.status_code == 404

    def test_patch_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        data2 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "De Zuid",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        response1 = client.post(f"{backend_url}/building/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/building/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/building/{id}/", follow=True)
        for key in data2:
            # all data should be present
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        response2 = client.patch(f"{backend_url}/building/123434687658/", data, follow=True)
        assert response2.status_code == 404

    def test_patch_error_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        data2 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "De Zuid",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        response1 = client.post(f"{backend_url}/building/", data1, follow=True)
        _ = client.post(f"{backend_url}/building/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/building/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        response1 = client.post(f"{backend_url}/building/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/building/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/building/{id}/", follow=True)
        assert response3.status_code == 404

    def test_remove_nonexistent_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/building/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_building(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        _ = client.post(f"{backend_url}/building/", data1, follow=True)
        response1 = client.post(f"{backend_url}/building/", data1, follow=True)
        assert response1.status_code == 400


class AuthorizationTests(TestCase):
    roles = ["Default", "Admin", "Superstudent", "Student", "Syndic"]

    def test_building_list(self):
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
            resp = client.get(f"{backend_url}/building/all")
            assert resp.status_code == codes[role]

    def test_insert_building(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 403,
            "Syndic": 403
        }
        number = 1
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            r_id = insert_dummy_region()
            s_id = insert_dummy_syndic()
            data = {
                "city": "Gent",
                "postal_code": 9000,
                "street": "Overpoort",
                "house_number": number,  # unique (local) number to avoid collision errors
                "client_number": "1234567890abcdef",
                "duration": "1:00:00",
                "region": r_id,
                "syndic": s_id,
                "name": "CB"
            }
            number += 1
            resp = client.post(f"{backend_url}/building/", data, follow=True)
            assert resp.status_code == codes[role]

    def test_get_building(self):
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
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        print(s_id)

        response1 = adminClient.post(f"{backend_url}/building/", data, follow=True)
        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            if role == "Syndic":
                print(user.id)
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(f"{backend_url}/building/{id}/", follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]
        # testing special case when syndic is owner of building
        user = User.objects.filter(id=s_id)[0]  # there should only be 1
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.get(f"{backend_url}/building/{id}/", follow=True)
        assert response2.status_code == 200


    def test_patch_building(self):
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
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        data2 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "De Zuid",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        response1 = adminClient.post(f"{backend_url}/building/", data1, follow=True)
        id = response1.data["id"]
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.patch(f"{backend_url}/building/{id}/", data2, follow=True)
            assert response2.status_code == codes[role]
        # testing special case when syndic is owner of building
        # patch shouldn't be allowed either way
        user = User.objects.filter(id=s_id)[0]  # there should only be 1
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.patch(f"{backend_url}/building/{id}/", data2, follow=True)
        assert response2.status_code == 403

    def test_remove_building(self):
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
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "1:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB"
        }
        exists = False
        for role in roles:
            if not exists:
                # building toevoegen als admin
                response1 = adminClient.post(f"{backend_url}/building/", data1, follow=True)
                print(response1.status_code)
                print(response1.data)
                id = response1.data["id"]
            # proberen verwijderen als `role`
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.delete(f"{backend_url}/building/{id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
