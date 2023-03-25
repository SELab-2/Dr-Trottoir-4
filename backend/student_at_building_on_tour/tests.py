from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url
from util.data_generators import createUser, insert_dummy_building_on_tour


class StudBuildTourTests(TestCase):
    def test_empty_comment_list(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(f"{backend_url}/student-at-building-on-tour/all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        resp = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        print(resp.status_code)
        print(resp.data)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}

        _ = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        response = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        assert response.status_code == 400

    def test_get_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}

        response1 = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        assert response1.status_code == 201
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response1.data
        # er moet ook een id bij zitten
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            # alle info zou er in moeten zitten
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/student-at-building-on-tour/123456789", follow=True)
        assert resp.status_code == 400  # should be changed to 404

    def test_patch_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data1 = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        data2 = {"building_on_tour": b_id, "date": "2023-03-10", "student": user.id}
        response1 = client.post(f"{backend_url}/student-at-building-on-tour/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/student-at-building-on-tour/{id}/", data2, follow=True)
        assert response2.status_code == 200
        response3 = client.get(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
        for key in data2:
            # alle info zou er in moeten zitten
            assert key in response3.data
        assert response3.status_code == 200
        assert "id" in response3.data

    def test_patch_invalid_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        response2 = client.patch(f"{backend_url}/student-at-building-on-tour/123434687658/", data, follow=True)
        assert response2.status_code == 400

    def test_patch_error_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data1 = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        data2 = {"building_on_tour": b_id, "date": "2023-03-10", "student": user.id}
        response1 = client.post(f"{backend_url}/student-at-building-on-tour/", data1, follow=True)
        _ = client.post(f"{backend_url}/student-at-building-on-tour/", data2, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.patch(f"{backend_url}/student-at-building-on-tour/{id}/", data2, follow=True)
        assert response2.status_code == 400

    def test_remove_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data1 = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        response1 = client.post(f"{backend_url}/student-at-building-on-tour/", data1, follow=True)
        assert response1.status_code == 201
        id = response1.data["id"]
        response2 = client.delete(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
        assert response2.status_code == 204
        response3 = client.get(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
        # should be 404 I think
        # assert response3.status_code == 404
        assert response3.status_code == 400

    def test_remove_nonexistent_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/student-at-building-on-tour/123456789/", follow=True)
        assert response2.status_code == 400

    def test_add_existing_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        _ = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        response1 = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        assert response1.status_code == 400
