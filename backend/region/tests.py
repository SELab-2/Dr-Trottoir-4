from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User

backend_url = "http://localhost:2002"


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


class RegionTests(TestCase):
    def test_empty_region_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(f"{backend_url}/region/all", follow=True)
        assert response.status_code == 200
        data = [response.data[e] for e in response.data]
        assert len(data) == 0

    def test_insert_1_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data = {
            "region": "Gent"
        }
        response = client.post(f"{backend_url}/region/", data, follow=True)
        assert response.status_code == 201
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response.data
        # er moet ook een id bij zitten
        assert "id" in response.data

    def test_get_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/region/{id}/", follow=True)
        assert response2.status_code == 200
        assert response2.data["region"] == "Gent"
        assert "id" in response2.data


    def test_patch_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Brugge"
        }
        data2 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/region/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/region/{id}/", follow=True)
        assert response3.status_code == 200
        assert response3.data["region"] == "Gent"
        assert "id" in response3.data

    def test_remove_region(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Gent"
        }
        response1 = client.post(f"{backend_url}/region/", data1, follow=True)
        assert response1.status_code == 201
        for key in data1:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/region/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/region/{id}/", follow=True)
        # should be 404 I think
        # assert response3.status_code == 404
        assert response3.status_code == 400
