from base.models import Role
from base.serializers import RoleSerializer
from util.data_generators import insert_dummy_role
from util.test_tools import BaseTest, BaseAuthTest


class RoleTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    # no empty_list test because there will be regions since there is an admin client
    # the admin used in that client has a region so the empty_list test will never succeed

    def test_insert_role(self):
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.insert("role/")

    def test_insert_dupe_role(self):
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.insert_dupe("role/")

    def test_get_role(self):
        r_id = insert_dummy_role("testRole")
        data = RoleSerializer(Role.objects.get(id=r_id)).data
        self.get(f"role/{r_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("role/")

    def test_patch_role(self):
        r_id = insert_dummy_role("TestRole")
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.patch(f"role/{r_id}")

    def test_patch_invalid_role(self):
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.patch_invalid("role/")

    def test_patch_error_role(self):
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.data2 = {"name": "Test2", "rank": 2, "description": "testRole"}
        self.patch_error("role/")

    def test_remove_role(self):
        r_id = insert_dummy_role("testRole")
        self.remove(f"role/{r_id}")

    def test_remove_non_existent_role(self):
        self.remove_invalid("role/")


class RoleAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_role_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("role/", codes)

    def test_insert_role(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 403, "Student": 403, "Syndic": 403}
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.insert_view("role/", codes)

    def test_get_role(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        r_id = insert_dummy_role("testRole")
        self.get_view(f"role/{r_id}", codes)

    def test_patch_role(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        r_id = insert_dummy_role("testRole")
        self.data1 = {"name": "Test", "rank": 2, "description": "testRole"}
        self.patch_view(f"role/{r_id}", codes)

    def test_remove_role(self):
        def create():
            return insert_dummy_role("testRole")

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("role/", codes, create=create)
