from base.models import GarbageCollection
from base.serializers import GarbageCollectionSerializer
from util.data_generators import insert_dummy_building, insert_dummy_garbage
from util.test_tools import BaseTest, BaseAuthTest


class GarbageCollectionTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_garbage_list(self):
        self.empty_list("garbage-collection/")

    def test_insert_garbage(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "RES"}
        self.insert("garbage-collection/")

    def test_insert_dupe_garbage(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "RES"}
        self.insert_dupe("garbage-collection/")

    def test_get_garbage(self):
        g_id = insert_dummy_garbage()
        data = GarbageCollectionSerializer(GarbageCollection.objects.get(id=g_id)).data
        self.get(f"garbage-collection/{g_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("garbage-collection/")

    def test_patch_garbage(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "PMD"}
        g_id = insert_dummy_garbage()
        self.patch(f"garbage-collection/{g_id}")

    def test_patch_invalid_garbage(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "RES"}
        self.patch_invalid("garbage-collection/")

    def test_patch_error_garbage(self):
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "RES"}
        self.data2 = {"building": b_id, "date": "2023-03-08", "garbage_type": "PMD"}
        self.patch_error("garbage-collection/")

    def test_remove_garbage(self):
        g_id = insert_dummy_garbage()
        self.remove(f"garbage-collection/{g_id}")

    def test_remove_nonexistent_garbage(self):
        self.remove_invalid("garbage-collection/")


class GarbageCollectionAuthorizationTests(BaseAuthTest):
    def test_garbage_collection_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("garbage-collection/", codes)

    def test_insert_garbage_collection(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "RES"}
        self.insert_view("garbage-collection/", codes)

    def test_get_garbage_collection(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        g_id = insert_dummy_garbage()
        self.get_view(f"garbage-collection/{g_id}", codes)

    def test_patch_garbage_collection(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        g_id = insert_dummy_garbage()
        b_id = insert_dummy_building()
        self.data1 = {"building": b_id, "date": "2023-03-08", "garbage_type": "PMD"}
        self.patch_view(f"garbage-collection/{g_id}", codes)

    def test_remove_garbage_collection(self):
        def create():
            return insert_dummy_garbage()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("garbage-collection/", codes, create=create)
