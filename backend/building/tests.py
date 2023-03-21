from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User, Region

backend_url = "http://localhost:2002"


def insert_dummy_region():
    r = Region(region="Gent")
    r.save()
    return r.id


def insert_dummy_syndic():
    s = User(
        first_name="test",
        last_name="test",
        phone_number="0487172529",
        role="SY"
    )
    s.save()
    return s.id


def createUser(is_staff: bool = True) -> User:
    user = User(
        first_name="test",
        last_name="test",
        email="test@test.com",
        is_staff=is_staff,
        is_active=True,
        phone_number="+32485710347",
        role="AD"
    )
    user.save()
    return user


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

    def test_get_tour(self):
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
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/building/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/building/123456789", follow=True)
        assert resp.status_code == 400  # should be changed to 404

    def test_patch_tour(self):
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
            # alle info zou er in moeten zitten
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_tour(self):
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
        assert response2.status_code == 400

    def test_patch_error_tour(self):
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

    def test_remove_tour(self):
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
        # should be 404 I think
        # assert response3.status_code == 404
        assert response3.status_code == 400

    def test_remove_nonexistent_tour(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/building/123456789/", follow=True)
        assert response2.status_code == 400

    def test_add_existing_region(self):
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
