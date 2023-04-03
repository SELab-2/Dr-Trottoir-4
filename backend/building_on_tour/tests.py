from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url, roles
from util.data_generators import createUser, insert_dummy_tour, insert_dummy_building


class BuildingOnTourTests(TestCase):
    def test_empty_building_on_tour_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/building-on-tour/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        resp = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }

        _ = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        response = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        assert response.status_code == 400

    def test_get_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }

        response1 = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # all the data should be present
            assert key in response1.data
        # an ID should be returned
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/building-on-tour/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # all the data should be present
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/building-on-tour/123456789", follow=True)
        assert resp.status_code == 404

    def test_patch_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)

        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        data2 = {
            "tour": t_id,
            "building": b_id,
            "index": 1
        }
        response1 = client.post(f"{backend_url}/building-on-tour/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/building-on-tour/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/building-on-tour/{id}/", follow=True)
        for key in data2:
            # all the data should be present
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        response2 = client.patch(f"{backend_url}/building-on-tour/123434687658/", data, follow=True)
        assert response2.status_code == 404

    def test_patch_error_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)

        t_id = insert_dummy_tour()
        b_id1 = insert_dummy_building()
        b_id2 = insert_dummy_building(street="Zuid")
        data1 = {
            "tour": t_id,
            "building": b_id1,
            "index": 0
        }
        data2 = {
            "tour": t_id,
            "building": b_id2,
            "index": 1
        }
        response1 = client.post(f"{backend_url}/building-on-tour/", data1, follow=True)
        dummyResponse = client.post(f"{backend_url}/building-on-tour/", data2, follow=True)
        print(dummyResponse.status_code)
        print(dummyResponse.data)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/building-on-tour/{id}/", data2, follow=True)
        print(response2.status_code)
        print(response2.data)
        assert response2.status_code == 400

    def test_remove__building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        response1 = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/building-on-tour/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/building-on-tour/{id}/", follow=True)
        assert response3.status_code == 404

    def test_remove_nonexistent_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/building-on-tour/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_building_on_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        _ = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        response1 = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
        assert response1.status_code == 400


class BuildingOnTourAuthorizationTests(TestCase):

    def test_building_on_tour_list(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 200,
            "Syndic": 403
        }
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            resp = client.get(f"{backend_url}/building-on-tour/all")
            assert resp.status_code == codes[role]

    def test_insert_building_on_tour(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 403,
            "Syndic": 403
        }
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            data = {
                "tour": t_id,
                "building": b_id,
                "index": 0
            }
            resp = client.post(f"{backend_url}/building-on-tour/", data, follow=True)
            print(resp.data)
            assert resp.status_code == codes[role]
            if resp.status_code == 201:
                print(f"[{role}]\tinserted, removing again")
                id = resp.data["id"]
                print(id)
                adminClient.delete(f"{backend_url}/building-on-tour/{id}/", follow=True)

    def test_get_building_on_tour(self):
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
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        
        response1 = adminClient.post(f"{backend_url}/building-on-tour/", data, follow=True)
        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(f"{backend_url}/building-on-tour/{id}/", follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]


    def test_patch_building_on_tour(self):
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
        t_id = insert_dummy_tour()
        b_id1 = insert_dummy_building()
        b_id2 = insert_dummy_building(street="Zuid")
        data1 = {
            "tour": t_id,
            "building": b_id1,
            "index": 0
        }
        data2 = {
            "tour": t_id,
            "building": b_id2,
            "index": 1
        }
        response1 = adminClient.post(f"{backend_url}/building-on-tour/", data1, follow=True)
        id = response1.data["id"]
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.patch(f"{backend_url}/building-on-tour/{id}/", data2, follow=True)
            assert response2.status_code == codes[role]

    def test_remove_building_on_tour(self):
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
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        exists = False
        for role in roles:
            if not exists:
                # building toevoegen als admin
                response1 = adminClient.post(f"{backend_url}/building-on-tour/", data1, follow=True)
                id = response1.data["id"]
            # proberen verwijderen als `role`
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.delete(f"{backend_url}/building-on-tour/{id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
