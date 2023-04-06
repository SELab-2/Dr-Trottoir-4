from django.test import TestCase
from rest_framework.test import APIClient

from base.test_settings import backend_url, roles
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
            assert key in response1.data
        assert "id" in response1.data
        id = response1.data["id"]
        response2 = client.get(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
        assert response2.status_code == 200
        for key in data:
            assert key in response2.data
        assert "id" in response2.data

    def test_get_non_existing(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user)
        resp = client.get(f"{backend_url}/student-at-building-on-tour/123456789", follow=True)
        assert resp.status_code == 404

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
        assert response2.status_code == 404

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
        assert response3.status_code == 404

    def test_remove_nonexistent_comment(self):
        user = createUser()
        client = APIClient()
        client.force_authenticate(user=user)
        response2 = client.delete(f"{backend_url}/student-at-building-on-tour/123456789/", follow=True)
        assert response2.status_code == 404

    def test_add_existing_comment(self):
        user = createUser(withRegion=True)
        client = APIClient()
        client.force_authenticate(user=user)
        b_id = insert_dummy_building_on_tour()
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        _ = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        response1 = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
        assert response1.status_code == 400


class StudBuildTourAuthorizationTests(TestCase):
    def test_student_at_building_on_tour_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            resp = client.get(f"{backend_url}/student-at-building-on-tour/all")
            assert resp.status_code == codes[role]

    def test_insert_student_at_building_on_tour(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building_on_tour()
        user = createUser("Student", withRegion=True)
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}

        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)

            resp = client.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)
            if resp.status_code != codes[role]:
                print(f"role: {role}\tcode: {resp.status_code} (expected {codes[role]})")
                print(resp.data)
            assert resp.status_code == codes[role]
            if resp.status_code == 201:
                id = resp.data["id"]
                adminClient.delete(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)

    def test_get_student_at_building_on_tour(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building_on_tour()
        user = createUser("Student", withRegion=True)
        data = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}

        response1 = adminClient.post(f"{backend_url}/student-at-building-on-tour/", data, follow=True)

        id = response1.data["id"]
        assert response1.status_code == 201
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
            if response2.status_code != codes[role]:
                print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
            assert response2.status_code == codes[role]

    def test_patch_student_at_building_on_tour(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building_on_tour()
        user = createUser("Student", withRegion=True)
        data1 = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}
        data2 = {"building_on_tour": b_id, "date": "2023-03-10", "student": user.id}

        response1 = adminClient.post(f"{backend_url}/student-at-building-on-tour/", data1, follow=True)
        id = response1.data["id"]
        for role in roles:
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.patch(f"{backend_url}/student-at-building-on-tour/{id}/", data2, follow=True)
            assert response2.status_code == codes[role]

    def test_remove_student_at_building_on_tour(self):
        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        adminUser = createUser()
        adminClient = APIClient()
        adminClient.force_authenticate(user=adminUser)

        b_id = insert_dummy_building_on_tour()
        user = createUser("Student", withRegion=True)
        data1 = {"building_on_tour": b_id, "date": "2023-03-08", "student": user.id}

        exists = False
        for role in roles:
            if not exists:
                # building toevoegen als admin
                response1 = adminClient.post(f"{backend_url}/student-at-building-on-tour/", data1, follow=True)
                id = response1.data["id"]
            # proberen verwijderen als `role`
            user = createUser(role)
            client = APIClient()
            client.force_authenticate(user)
            response2 = client.delete(f"{backend_url}/student-at-building-on-tour/{id}/", follow=True)
            assert response2.status_code == codes[role]
            exists = codes[role] != 204
