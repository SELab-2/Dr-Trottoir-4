from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User


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
        response = client.get("http://localhost:2002/region/all", follow=True)
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
        response = client.post("http://localhost:2002/region/", data, follow=True)
        assert response.status_code == 201
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response.data
        # er moet ook een id bij zitten
        assert "id" in response.data

    def test_insert_multiple_regions(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        data1 = {
            "region": "Gent"
        }
        data2 = {
            "region": "Antwerpen"
        }
        response1 = client.post("http://localhost:2002/region/", data1, follow=True)
        response2 = client.post("http://localhost:2002/region/", data2, follow=True)
        assert response1.status_code == 201
        assert response2.status_code == 201
        for key in data1:
            # alle info zou er in moeten zitten
            assert key in response1.data
        for key in data2:
            # alle info zou er in moeten zitten
            assert key in response2.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        assert "id" in response2.data
        results = client.get("/region/all/")
        print([r for r in results.data])
        assert False
