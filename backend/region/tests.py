from base.models import Region
from base.serializers import RegionSerializer
from util.data_generators import insert_dummy_region
from util.test_tools import BaseTest, BaseAuthTest


class RegionTests(BaseTest):
    def test_empty_region_list(self):
        self.empty_list("region/")

    def test_insert_region(self):
        self.data1 = {"region": "Gent"}
        self.insert("region/")

    def test_insert_dupe_region(self):
        self.data1 = {"region": "Gent"}
        self.insert_dupe("region/")

    def test_get_region(self):
        r_id = insert_dummy_region()
        data = RegionSerializer(Region.objects.get(id=r_id)).data
        self.get(f"region/{r_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("region/")

    def test_patch_region(self):
        r_id = insert_dummy_region("Brugge")
        self.data1 = {"region": "Gent"}
        self.patch(f"region/{r_id}")

    def test_patch_invalid_region(self):
        self.data1 = {"region": "Gent"}
        self.patch_invalid("region/")

    def test_patch_error_region(self):
        self.data1 = {"region": "Brugge"}
        self.data2 = {"region": "Gent"}
        self.patch_error("region/")

    def test_remove_region(self):
        r_id = insert_dummy_region()
        self.remove(f"region/{r_id}")

    def test_remove_non_existent_region(self):
        self.remove_invalid("region/")


class RegionAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_region_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        self.list_view("region/", codes)

    def test_insert_region(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 403, "Student": 403, "Syndic": 403}
        self.data1 = {"region": "Gent"}
        self.insert_view("region/", codes)

    def test_get_region(self):
        codes = {"Default": 200, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 200}
        r_id = insert_dummy_region()
        self.get_view(f"region/{r_id}", codes)

    def test_patch_region(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 403, "Student": 403, "Syndic": 403}
        r_id = insert_dummy_region("Bruhhe")
        self.data1 = {"region": "Gent"}
        self.patch_view(f"region/{r_id}", codes)

    def test_remove_region(self):
        def create():
            return insert_dummy_region()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 403, "Student": 403, "Syndic": 403}
        self.remove_view("region/", codes, create=create)
