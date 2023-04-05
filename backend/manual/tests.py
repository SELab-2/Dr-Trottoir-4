from django.test import TestCase
from rest_framework.test import APIClient

from base.models import Manual
from base.serializers import ManualSerializer
from base.test_settings import backend_url, roles
from util.data_generators import createUser, insert_dummy_building, createMemoryFile, insert_dummy_manual
from util.test_tools import BaseTest, BaseAuthTest

f = createMemoryFile("./manual/lorem-ipsum.pdf")


class ManualTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_manual_list(self):
        self.empty_list("manual/")

    def test_insert_manual(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f}
        self.insert("manual/")

    def test_insert_dupe_manual(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f, "version_number": 0}
        self.insert_dupe("manual/", special=201)

    def test_get_manual(self):
        m_id = insert_dummy_manual()
        data = ManualSerializer(Manual.objects.get(id=m_id)).data
        self.get(f"manual/{m_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("manual/")

    def test_patch_manual(self):
        m_id = insert_dummy_manual()
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f, "version_number": 1}
        self.patch(f"manual/{m_id}", special=[("version_number", 0)])

    def test_patch_invalid_manual(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f, "version_number": 0}
        self.patch_invalid("manual/")

    def test_patch_error_manual(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f, "version_number": 0}
        self.data2 = {"building": b_id, "file": f, "version_number": 1}
        self.patch_error("manual/", special=200)

    def test_remove_manual(self):
        m_id = insert_dummy_manual()
        self.remove(f"manual/{m_id}")

    def test_remove_nonexistent_manual(self):
        self.remove_invalid("manual/")


class ManualAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_manual_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("manual/", codes)

    def test_insert_manual(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 201}
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f, "version_number": 0}
        self.insert_view("manual/", codes)

    def test_get_manual(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        m_id = insert_dummy_manual()
        self.get_view(f"manual/{m_id}", codes)

    def test_patch_manual(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        m_id = insert_dummy_manual()
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "file": f, "version_number": 1}
        self.patch_view(f"manual/{m_id}", codes)

    def test_remove_manual(self):
        def create():
            return insert_dummy_manual()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("manual/", codes, create=create)
