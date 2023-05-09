from datetime import datetime

import pytz

from base.models import RemarkAtBuilding, StudentOnTour
from base.serializers import RemarkAtBuildingSerializer
from util.data_generators import insert_dummy_student_on_tour, insert_dummy_building, insert_dummy_remark_at_building
from util.test_tools import BaseTest, BaseAuthTest


class RemarkAtBuildingTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_remark_at_building_list(self):
        self.empty_list("remark-at-building/")

    def test_insert_remark_at_building(self):
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "illegal dumping",
            "type": "AA",
        }
        self.insert("remark-at-building/")

    def test_insert_empty(self):
        self.insert_empty("remark-at-building/")

    def test_insert_dupe_remark_at_building(self):
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "illegal dumping",
            "type": "AA",
        }
        self.insert_dupe("remark-at-building/")

    def test_get_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        data = RemarkAtBuildingSerializer(RemarkAtBuilding.objects.get(id=r_id)).data
        self.get(f"remark-at-building/{r_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("remark-at-building/")

    def test_patch_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "couldn't enter the building",
            "type": "AA",
        }
        self.patch(f"remark-at-building/{r_id}")

    def test_patch_invalid_remark_at_building(self):
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "couldn't enter the building",
            "type": "AA",
        }
        self.patch_invalid(f"remark-at-building/")

    def test_patch_error_remark_at_building(self):
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "couldn't enter the building",
            "type": "AA",
        }
        self.data2 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "code was wrong",
            "type": "AA",
        }
        self.patch_error(f"remark-at-building/")

    def test_remove_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        self.remove(f"remark-at-building/{r_id}")

    def test_remove_non_existing_remark_at_building(self):
        self.remove_invalid("remark-at-building/")


class RemarkAtBuildingAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_remark_at_building_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        self.list_view("remark-at-building/", codes)

    def test_insert_remark_at_building(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        SoT = insert_dummy_student_on_tour()
        specialStudent = StudentOnTour.objects.get(id=SoT).student.id
        self.data1 = {
            "student_on_tour": SoT,
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "no bins present",
            "type": "AA",
        }
        self.insert_view("remark-at-building/", codes, special=[(specialStudent, 201)])

    def test_get_remark_at_building(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        RaB_id = insert_dummy_remark_at_building()
        specialStudent = RemarkAtBuilding.objects.get(id=RaB_id).student_on_tour.student.id
        self.get_view(f"remark-at-building/{RaB_id}", codes, special=[(specialStudent, 200)])

    def test_patch_remark_at_building(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        RaB_id = insert_dummy_remark_at_building()
        specialStudent = RemarkAtBuilding.objects.get(id=RaB_id).student_on_tour.student.id
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "no bins present",
            "type": "OP",
        }
        self.patch_view(f"remark-at-building/{RaB_id}", codes, special=[(specialStudent, 200)])

    def test_remove_remark_at_building(self):
        # testing the special case where the student of the tour removes the instance is very difficult,
        # since there are always new instances created and there is no way to access them from here
        def create():
            return insert_dummy_remark_at_building()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("remark-at-building/", codes, create=create)
