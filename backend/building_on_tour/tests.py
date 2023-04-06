from base.models import BuildingOnTour
from base.serializers import BuildingTourSerializer
from util.data_generators import insert_dummy_tour, insert_dummy_building, insert_dummy_building_on_tour
from util.test_tools import BaseTest, BaseAuthTest


class BuildingOnTourTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_building_on_tour_list(self):
        self.empty_list("building-on-tour/")

    def test_insert_building_on_tour(self):
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        self.data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        self.insert("building-on-tour/")

    def test_insert_dupe_building_on_tour(self):
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        self.data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }

        self.insert_dupe(f"building-on-tour/")

    def test_get_building_on_tour(self):
        BoT_id = insert_dummy_building_on_tour()
        data = BuildingTourSerializer(BuildingOnTour.objects.get(id=BoT_id)).data

        self.get(f"building-on-tour/{BoT_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("building-on-tour/")

    def test_patch_building_on_tour(self):
        BoT_id = insert_dummy_building_on_tour()
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        self.data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        self.patch(f"building-on-tour/{BoT_id}")

    def test_patch_invalid_building_on_tour(self):
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        self.data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        self.patch_invalid("building-on-tour/")

    def test_patch_error_building_on_tour(self):
        t_id = insert_dummy_tour()
        b_id1 = insert_dummy_building()
        b_id2 = insert_dummy_building(street="Zuid")
        self.data1 = {
            "tour": t_id,
            "building": b_id1,
            "index": 0
        }
        self.data2 = {
            "tour": t_id,
            "building": b_id2,
            "index": 1
        }
        self.patch_error("building-on-tour/")

    def test_remove_building_on_tour(self):
        BoT_id = insert_dummy_building_on_tour()
        self.remove(f"building-on-tour/{BoT_id}")

    def test_remove_nonexistent_building_on_tour(self):
        self.remove_invalid("building-on-tour/")


class BuildingOnTourAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_building_on_tour_list(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 200,
            "Syndic": 403
        }
        self.list_view("building-on-tour/", codes)

    def test_insert_building_on_tour(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 403,
            "Syndic": 403
        }
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building()
        self.data1 = {
            "tour": t_id,
            "building": b_id,
            "index": 0
        }
        self.insert_view("building-on-tour/", codes)

    def test_get_building_on_tour(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 200,
            "Syndic": 403
        }
        BoT_id = insert_dummy_building_on_tour()
        self.get_view(f"building-on-tour/{BoT_id}", codes)

    def test_patch_building_on_tour(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        BoT_id = insert_dummy_building_on_tour()
        t_id = insert_dummy_tour()
        b_id = insert_dummy_building(street="Zuid")
        self.data2 = {
            "tour": t_id,
            "building": b_id,
            "index": 1
        }
        self.patch_view(f"building-on-tour/{BoT_id}", codes)

    def test_remove_building_on_tour(self):
        def create():
            return insert_dummy_building_on_tour()

        codes = {
            "Default": 403,
            "Admin": 204,
            "Superstudent": 204,
            "Student": 403,
            "Syndic": 403
        }
        self.remove_view("building-on-tour/", codes, create=create)
