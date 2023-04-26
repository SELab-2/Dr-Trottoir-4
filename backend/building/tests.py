from base.models import Building
from base.serializers import BuildingSerializer
from util.data_generators import insert_dummy_region, insert_dummy_syndic, insert_dummy_building
from util.test_tools import BaseTest, BaseAuthTest


class BuildingTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_building_list(self):
        self.empty_list("building/")

    def test_insert_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": "9000",
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.insert("building/")

    def test_insert_empty(self):
        self.insert_empty("building/")

    def test_insert_dupe_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": "9000",
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.insert_dupe("building/")

    def test_get_building(self):
        b_id = insert_dummy_building()
        data = BuildingSerializer(Building.objects.get(id=b_id)).data
        self.get(f"building/{b_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent(f"building/")

    def test_patch_building(self):
        b_id = insert_dummy_building()

        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": "9000",
            "street": "De Zuid",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.patch(f"building/{b_id}")

    def test_patch_invalid_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": "9000",
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.patch_invalid("building/")

    def test_patch_error_building(self):
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": "9000",
            "street": "Overpoort",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.data2 = {
            "city": "Gent",
            "postal_code": "9000",
            "street": "De Zuid",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.patch_error("building/")

    def test_remove_building(self):
        b_id = insert_dummy_building()
        self.remove(f"building/{b_id}")

    def test_remove_nonexistent_building(self):
        self.remove_invalid("building/")


class BuildingAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_building_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("building/", codes)

    def test_insert_building(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "Overpoort",
            "house_number": 10,  # unique (local) number to avoid collision errors
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.insert_view("building/", codes)

    def test_get_building(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        b_id = insert_dummy_building()
        s_id = Building.objects.get(id=b_id).syndic.id
        self.get_view(f"building/{b_id}", codes, special=[(s_id, 200)])

    def test_patch_building(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        b_id = insert_dummy_building()
        owner_id = Building.objects.get(id=b_id).syndic.id
        r_id = insert_dummy_region()
        s_id = insert_dummy_syndic()
        self.data1 = {
            "city": "Gent",
            "postal_code": 9000,
            "street": "De Zuid",
            "house_number": 10,
            "client_number": "1234567890abcdef",
            "duration": "01:00:00",
            "region": r_id,
            "syndic": s_id,
            "name": "CB",
        }
        self.patch_view(f"building/{b_id}", codes, special=[(owner_id, 403)])

    def test_remove_building(self):
        def create():
            return insert_dummy_building()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("building/", codes, create=create)
