from base.models import Tour
from base.serializers import TourSerializer
from util.data_generators import insert_dummy_region, insert_dummy_tour
from util.test_tools import BaseTest, BaseAuthTest


class TourTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_tour_list(self):
        self.empty_list("tour/")

    def test_insert_tour(self):
        r_id = insert_dummy_region()
        self.data1 = {"name": "Sterre", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.insert("tour/")

    def test_insert_dupe_tour(self):
        r_id = insert_dummy_region()
        self.data1 = {"name": "Sterre", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.insert_dupe("tour/")

    def test_get_tour(self):
        t_id = insert_dummy_tour()
        data = TourSerializer(Tour.objects.get(id=t_id)).data
        self.get(f"tour/{t_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("tour/")

    def test_patch_tour(self):
        t_id = insert_dummy_tour()
        r_id = insert_dummy_region()
        self.data1 = {"name": "Overpoort", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.patch(f"tour/{t_id}")

    def test_patch_invalid_tour(self):
        r_id = insert_dummy_region()
        self.data1 = {"name": "Sterre", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.patch_invalid("tour/")

    def test_patch_error_tour(self):
        r_id = insert_dummy_region()
        self.data1 = {"name": "Sterre", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.data2 = {"name": "Overpoort", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.patch_error("tour/")

    def test_remove_tour(self):
        t_id = insert_dummy_tour()
        self.remove(f"tour/{t_id}")

    def test_remove_nonexistent_tour(self):
        self.remove_invalid("tour/")


class TourAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_lobby_tour(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("tour/", codes)

    def test_insert_tour(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        r_id = insert_dummy_region()
        self.data1 = {"name": "Sterre", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.insert_view("tour/", codes)

    def test_get_tour(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        t_id = insert_dummy_tour()
        self.get_view(f"tour/{t_id}", codes)

    def test_patch_tour(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        t_id = insert_dummy_tour()
        r_id = insert_dummy_region()
        self.data1 = {"name": "OverPoort", "region": r_id, "modified_at": "2023-03-08T12:08:29+01:00"}
        self.patch_view(f"tour/{t_id}", codes)

    def test_remove_tour(self):
        def create():
            return insert_dummy_tour()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("tour/", codes, create=create)
