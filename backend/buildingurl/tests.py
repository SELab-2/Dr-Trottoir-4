from django.test import TestCase
from rest_framework.test import APIClient

from util.data_generators import createUser

backend_url = "http://localhost:2002"


class BuildingOnTourTests(TestCase):
    def test_empty_buildingurl(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/buildingurl/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0


"""
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
        resp = client.post(f"{backend_url}/buildingurl/", data, follow=True)
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

        _ = client.post(f"{backend_url}/buildingurl/", data, follow=True)
        response = client.post(f"{backend_url}/buildingurl/", data, follow=True)
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

        response1 = client.post(f"{backend_url}/buildingurl/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/buildingurl/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/buildingurl/123456789", follow=True)
        assert resp.status_code == 400  # should be changed to 404

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
        response1 = client.post(f"{backend_url}/buildingurl/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/buildingurl/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/buildingurl/{id}/", follow=True)
        for key in data2:
            # alle info zou er in moeten zitten
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
        response2 = client.patch(f"{backend_url}/buildingurl/123434687658/", data, follow=True)
        assert response2.status_code == 400

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
        response1 = client.post(f"{backend_url}/buildingurl/", data1, follow=True)
        dummyResponse = client.post(f"{backend_url}/buildingurl/", data2, follow=True)
        print(dummyResponse.status_code)
        print(dummyResponse.data)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/buildingurl/{id}/", data2, follow=True)
        print(response2.status_code)
        print(response2.data)
        assert response2.status_code == 400

    def test_remove_tour(self):
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
        response1 = client.post(f"{backend_url}/buildingurl/", data, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/buildingurl/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/buildingurl/{id}/", follow=True)
        # should be 404 I think
        # assert response3.status_code == 404
        assert response3.status_code == 400

    def test_remove_nonexistent_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/buildingurl/123456789/", follow=True)
        assert response2.status_code == 400

    def test_add_existing_region(self):
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
        _ = client.post(f"{backend_url}/buildingurl/", data, follow=True)
        response1 = client.post(f"{backend_url}/buildingurl/", data, follow=True)
        assert response1.status_code == 400
"""
