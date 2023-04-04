from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User, Building
from base.serializers import BuildingSerializer
from base.test_settings import backend_url, roles
from util.data_generators import createUser, insert_dummy_region, insert_dummy_syndic, insert_dummy_building
from util.test_tools import BaseTest


class BuildingTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_building_list(self):
        self.empty_list("building/all/")

    def test_insert_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
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
        self.insert("building/")

    def test_insert_dupe_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
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
        self.insert_dupe("building/")

    def test_get_building(self):

        b_id = insert_dummy_building()
        data = BuildingSerializer(Building.objects.get(id=b_id)).data
        print(data)
        self.get(f"building/{b_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent(f"building/")


    def test_patch_building(self):
        b_id = insert_dummy_building()

        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
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
        self.patch(f"building/{b_id}")

    def test_patch_invalid_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
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
        self.patch_invalid("building/")


    def test_patch_error_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
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
        self.data2 = {
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
        self.patch_error("building/")

    def test_remove_building(self):
        b_id = insert_dummy_building()
        self.remove(f"building/{b_id}")

    def test_remove_nonexistent_building(self):
        self.remove_invalid("building/")


    def test_add_existing_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
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
        self.add_dupe("building/")

# class BuildingAuthorizationTests(TestCase):
#
#     def test_building_list(self):
#         codes = {
#             "Default": 403,
#             "Admin": 200,
#             "Superstudent": 200,
#             "Student": 403,
#             "Syndic": 403
#         }
#         for role in roles:
#             user = createUser(role)
#             client = APIClient()
#             client.force_authenticate(user=user)
#             resp = client.get(f"{backend_url}/building/all")
#             assert resp.status_code == codes[role]
#
#     def test_insert_building(self):
#         codes = {
#             "Default": 403,
#             "Admin": 201,
#             "Superstudent": 201,
#             "Student": 403,
#             "Syndic": 403
#         }
#         number = 1
#         for role in roles:
#             user = createUser(role)
#             client = APIClient()
#             client.force_authenticate(user=user)
#             r_id = insert_dummy_region()
#             s_id = insert_dummy_syndic()
#             data = {
#                 "city": "Gent",
#                 "postal_code": 9000,
#                 "street": "Overpoort",
#                 "house_number": number,  # unique (local) number to avoid collision errors
#                 "client_number": "1234567890abcdef",
#                 "duration": "1:00:00",
#                 "region": r_id,
#                 "syndic": s_id,
#                 "name": "CB"
#             }
#             number += 1
#             resp = client.post(f"{backend_url}/building/", data, follow=True)
#             assert resp.status_code == codes[role]
#
#     def test_get_building(self):
#         codes = {
#             "Default": 403,
#             "Admin": 200,
#             "Superstudent": 200,
#             "Student": 200,
#             "Syndic": 403
#         }
#         adminUser = createUser()
#         adminClient = APIClient()
#         adminClient.force_authenticate(user=adminUser)
#         r_id = insert_dummy_region()
#         s_id = insert_dummy_syndic()
#         data = {
#             "city": "Gent",
#             "postal_code": 9000,
#             "street": "Overpoort",
#             "house_number": 10,
#             "client_number": "1234567890abcdef",
#             "duration": "1:00:00",
#             "region": r_id,
#             "syndic": s_id,
#             "name": "CB"
#         }
#         print(s_id)
#
#         response1 = adminClient.post(f"{backend_url}/building/", data, follow=True)
#         id = response1.data["id"]
#         assert response1.status_code == 201
#         for role in roles:
#             user = createUser(role)
#             client = APIClient()
#             client.force_authenticate(user=user)
#             response2 = client.get(f"{backend_url}/building/{id}/", follow=True)
#             if response2.status_code != codes[role]:
#                 print(f"role: {role}\tcode: {response2.status_code} (expected {codes[role]})")
#             assert response2.status_code == codes[role]
#         # testing special case when syndic is owner of building
#         user = User.objects.filter(id=s_id)[0]  # there should only be 1
#         client = APIClient()
#         client.force_authenticate(user=user)
#         response2 = client.get(f"{backend_url}/building/{id}/", follow=True)
#         assert response2.status_code == 200
#
#
#     def test_patch_building(self):
#         codes = {
#             "Default": 403,
#             "Admin": 200,
#             "Superstudent": 200,
#             "Student": 403,
#             "Syndic": 403
#         }
#         adminUser = createUser()
#         adminClient = APIClient()
#         adminClient.force_authenticate(user=adminUser)
#         r_id = insert_dummy_region()
#         s_id = insert_dummy_syndic()
#         data1 = {
#             "city": "Gent",
#             "postal_code": 9000,
#             "street": "Overpoort",
#             "house_number": 10,
#             "client_number": "1234567890abcdef",
#             "duration": "1:00:00",
#             "region": r_id,
#             "syndic": s_id,
#             "name": "CB"
#         }
#         data2 = {
#             "city": "Gent",
#             "postal_code": 9000,
#             "street": "De Zuid",
#             "house_number": 10,
#             "client_number": "1234567890abcdef",
#             "duration": "1:00:00",
#             "region": r_id,
#             "syndic": s_id,
#             "name": "CB"
#         }
#         response1 = adminClient.post(f"{backend_url}/building/", data1, follow=True)
#         id = response1.data["id"]
#         for role in roles:
#             user = createUser(role)
#             client = APIClient()
#             client.force_authenticate(user)
#             response2 = client.patch(f"{backend_url}/building/{id}/", data2, follow=True)
#             assert response2.status_code == codes[role]
#         # testing special case when syndic is owner of building
#         # patch shouldn't be allowed either way
#         user = User.objects.filter(id=s_id)[0]  # there should only be 1
#         client = APIClient()
#         client.force_authenticate(user=user)
#         response2 = client.patch(f"{backend_url}/building/{id}/", data2, follow=True)
#         assert response2.status_code == 403
#
#     def test_remove_building(self):
#         codes = {
#             "Default": 403,
#             "Admin": 204,
#             "Superstudent": 204,
#             "Student": 403,
#             "Syndic": 403
#         }
#         adminUser = createUser()
#         adminClient = APIClient()
#         adminClient.force_authenticate(user=adminUser)
#         r_id = insert_dummy_region()
#         s_id = insert_dummy_syndic()
#         data1 = {
#             "city": "Gent",
#             "postal_code": 9000,
#             "street": "Overpoort",
#             "house_number": 10,
#             "client_number": "1234567890abcdef",
#             "duration": "1:00:00",
#             "region": r_id,
#             "syndic": s_id,
#             "name": "CB"
#         }
#         exists = False
#         for role in roles:
#             if not exists:
#                 # building toevoegen als admin
#                 response1 = adminClient.post(f"{backend_url}/building/", data1, follow=True)
#                 id = response1.data["id"]
#             # proberen verwijderen als `role`
#             user = createUser(role)
#             client = APIClient()
#             client.force_authenticate(user)
#             response2 = client.delete(f"{backend_url}/building/{id}/", follow=True)
#             assert response2.status_code == codes[role]
#             exists = codes[role] != 204
