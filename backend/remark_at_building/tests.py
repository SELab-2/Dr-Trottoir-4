from datetime import datetime

import pytz
from pytz import all_timezones
from base.models import RemarkAtBuilding
from base.serializers import RemarkAtBuildingSerializer
from util.data_generators import insert_dummy_student_on_tour, insert_dummy_building, insert_dummy_remark_at_building
from util.test_tools import BaseTest


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
            "type": "AA"
        }
        self.insert("remark-at-building/")

    def test_insert_dupe_remark_at_building(self):
        self.data1 = {
            "student_on_tour": insert_dummy_student_on_tour(),
            "building": insert_dummy_building(),
            "timestamp": str(datetime.now(pytz.timezone("CET"))).replace(" ", "T"),
            "remark": "illegal dumping",
            "type": "AA"
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
            "type": "AA"
        }
        self.patch(f"remark-at-building/{r_id}")

    def test_remove_remark_at_building(self):
        r_id = insert_dummy_remark_at_building()
        self.remove(f"remark-at-building/{r_id}")

    def test_remove_non_existing_remark_at_building(self):
        self.remove_invalid("remark-at-building/")
