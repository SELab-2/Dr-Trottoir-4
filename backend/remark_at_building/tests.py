from datetime import datetime

from django.test import TestCase

from base.test_settings import backend_url
from util.data_generators import insert_dummy_student_on_tour, insert_dummy_building, insert_dummy_remark_at_building
from util.test_tools import get_authenticated_client


class RemarkAtBuilding(TestCase):
    def __init__(self, methodName="runTest"):
        self.client = get_authenticated_client()
        self.base_url = f"{backend_url}/remark-at-building/"
        super().__init__(methodName)

    def test_empty_remark_at_building_list(self):
        # TODO: make the following code generic (Super class)
        resp = self.client.get(self.base_url + "all", follow=True)
        assert resp.status_code == 200
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0

    def test_insert_remark_at_building(self):
        data = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": datetime.now(),
            "remark": "illegal dumping",
        }
        # TODO: make the following code generic (Super class): super().test_insert(data)
        resp = self.client.post(self.base_url, data, follow=True)
        assert resp.status_code == 201
        for key in data:
            assert key in resp.data
        assert "id" in resp.data

    def test_insert_dupe_remark_at_building(self):
        data = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": datetime.now(),
            "remark": "illegal dumping",
        }
        # TODO: make the following code generic (Super class): super().test_insert_dupe(data)
        resp = self.client.post(self.base_url, data, follow=True)
        assert resp.status_code == 201
        resp = self.client.post(self.base_url, data, follow=True)
        assert resp.status_code == 400

    def test_get_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        resp = self.client.get(self.base_url + r_id)
        assert resp.status_code == 200

    def test_get_non_existing(self):
        # TODO: move this code to the super class
        resp = self.client.get(self.base_url + "123456")
        assert resp.status_code == 404

    def test_patch_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        patch_data = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": datetime.now(),
            "remark": "couldn't enter the building",
        }
        # TODO: make the following code generic (Super class): super().test_patch(id, patch_data)
        resp1 = self.client.patch(self.base_url + r_id, patch_data)
        assert resp1.status_code == 200
        resp2 = self.client.get(self.base_url + r_id)
        assert resp2.status_code == 200
        for k in patch_data:
            assert k in resp2.data
        assert "id" in resp2.data

    def test_remove_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        # TODO: make the following code generic (Super class): super().test_delete(p_id)
        resp = self.client.delete(self.base_url + r_id)
        assert resp.status_code == 204
        resp = self.client.get(self.base_url + r_id)
        assert resp.status_code == 404

    def test_remove_non_existing_remark_at_building(self):
        # TODO: move this code to the super class
        resp = self.client.delete(self.base_url + "123456")
        assert resp.status_code == 404
