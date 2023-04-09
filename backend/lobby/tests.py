from base.models import Lobby
from base.serializers import LobbySerializer
from util.data_generators import insert_dummy_role, insert_dummy_lobby
from util.test_tools import BaseTest, BaseAuthTest


class LobbyTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_lobby_list(self):
        self.empty_list("lobby/")

    def test_insert_lobby(self):
        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby@example.com", "role": r_id}
        self.insert("lobby/")

    def test_insert_dupe_lobby(self):
        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby@example.com", "role": r_id}
        self.insert_dupe("lobby/")

    def test_get_lobby(self):
        l_id = insert_dummy_lobby()
        data = LobbySerializer(Lobby.objects.get(id=l_id)).data
        self.get(f"lobby/{l_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("lobby/")

    def test_patch_lobby(self):
        l_id = insert_dummy_lobby()
        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby@example.com", "role": r_id}
        self.patch(f"lobby/{l_id}")

    def test_patch_invalid_lobby(self):
        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby@example.com", "role": r_id}
        self.patch_invalid("lobby/")

    def test_patch_error_lobby(self):
        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby@example.com", "role": r_id}
        self.data2 = {"email": "test_lobby_new@example.com", "role": r_id}
        self.patch_error("lobby/")

    def test_remove_lobby(self):
        l_id = insert_dummy_lobby()
        self.remove(f"lobby/{l_id}")

    def test_remove_nonexistent_lobby(self):
        self.remove_invalid("lobby/")


class LobbyAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_lobby_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("lobby/", codes)

    def test_insert_lobby(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby@example.com", "role": r_id}
        self.insert_view("lobby/", codes)

    def test_get_lobby(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        l_id = insert_dummy_lobby()
        self.get_view(f"lobby/{l_id}", codes)

    def test_patch_lobby(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        l_id = insert_dummy_lobby()

        r_id = insert_dummy_role("Student")
        self.data1 = {"email": "test_lobby_new@example.com", "role": r_id}
        self.patch_view(f"lobby/{l_id}", codes)

    def test_remove_lobby(self):
        def create():
            return insert_dummy_lobby()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("lobby/", codes, create=create)
