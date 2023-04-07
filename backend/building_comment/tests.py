from base.models import BuildingComment
from base.serializers import BuildingCommentSerializer
from util.data_generators import insert_dummy_building, insert_dummy_building_comment
from util.test_tools import BaseTest, BaseAuthTest


class BuildingCommentTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_comment_list(self):
        self.empty_list("building-comment/")

    def test_insert_comment(self):
        b_id = insert_dummy_building()
        self.data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.insert("building-comment/")

    def test_insert_dupe_comment(self):
        b_id = insert_dummy_building()
        self.data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.insert_dupe("building-comment/")

    def test_get_comment(self):
        bc_id = insert_dummy_building_comment()
        data = BuildingCommentSerializer(BuildingComment.objects.get(id=bc_id)).data
        self.get(f"building-comment/{bc_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("building-comment/")

    def test_patch_comment(self):
        bc_id = insert_dummy_building_comment()
        b_id = insert_dummy_building()
        self.data1 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.patch(f"building-comment/{bc_id}")

    def test_patch_invalid_comment(self):
        b_id = insert_dummy_building()
        self.data1 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.patch_invalid(f"building-comment/")

    def test_patch_error_comment(self):
        b_id = insert_dummy_building()
        self.data1 = {"comment": "<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.data2 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.patch_error("building-comment/")

    def test_remove_comment(self):
        bc_id = insert_dummy_building_comment()
        self.remove(f"building-comment/{bc_id}")

    def test_remove_nonexistent_comment(self):
        self.remove_invalid("building-comment/")


class BuildingCommentAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_building_comment_list(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        self.list_view("building-comment/", codes)

    def test_insert_building_comment(self):
        codes = {"Default": 403, "Admin": 201, "Superstudent": 201, "Student": 403, "Syndic": 403}
        b_id = insert_dummy_building()
        self.data1 = {"comment": f"<3 python", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.insert_view("building-comment/", codes)

    def test_get_building_comment(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 200, "Syndic": 403}
        bc_id = insert_dummy_building_comment()
        s_id = BuildingComment.objects.get(id=bc_id).building.syndic.id
        self.get_view(f"building-comment/{bc_id}", codes, special=[(s_id, 200)])

    def test_patch_building_comment(self):
        codes = {"Default": 403, "Admin": 200, "Superstudent": 200, "Student": 403, "Syndic": 403}
        bc_id = insert_dummy_building_comment()
        owner_id = BuildingComment.objects.get(id=bc_id).building.syndic.id
        b_id = insert_dummy_building()
        self.data1 = {"comment": "<3 python and Typescript", "date": "2023-03-08T12:08:29+01:00", "building": b_id}
        self.patch_view(f"building-comment/{bc_id}", codes, special=[(owner_id, 403)])

    def test_remove_building_comment(self):
        def create():
            return insert_dummy_building_comment()

        codes = {"Default": 403, "Admin": 204, "Superstudent": 204, "Student": 403, "Syndic": 403}
        self.remove_view("building-comment/", codes, create=create)
