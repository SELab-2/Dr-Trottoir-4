from base.models import PictureOfRemark, RemarkAtBuilding
from base.serializers import PictureOfRemarkSerializer
from util.data_generators import insert_dummy_remark_at_building, createMemoryFile, insert_dummy_picture_of_remark
from util.test_tools import BaseTest, BaseAuthTest

f = createMemoryFile("./picture_of_remark/scrambled1.png")
f2 = createMemoryFile("./picture_of_remark/scrambled2.png")


class PictureOfRemarkTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_picture_of_remark(self):
        self.empty_list("picture-of-remark/")

    def test_insert_picture_of_remark(self):
        self.data1 = {"picture": f, "remark_at_building": insert_dummy_remark_at_building()}
        self.insert("picture-of-remark/")

    def test_insert_dupe_picture_of_remark(self):
        RaB = insert_dummy_remark_at_building()
        self.data1 = {"picture": f, "remark_at_building": RaB}
        self.insert_dupe("picture-of-remark/")

    def test_get_picture_of_remark(self):
        p_id = insert_dummy_picture_of_remark(picture=f)
        data = PictureOfRemarkSerializer(PictureOfRemark.objects.get(id=p_id)).data
        self.get(f"picture-of-remark/{p_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("picture-of-remark/")

    def test_patch_picture_of_remark(self):
        p_id = insert_dummy_picture_of_remark(f)
        RaB = insert_dummy_remark_at_building()
        self.data1 = {"picture": f2, "remark_at_building": RaB}
        self.patch(f"picture-of-remark/{p_id}")

    def test_patch_invalid_picture_of_remark(self):
        RaB = insert_dummy_remark_at_building()
        self.data1 = {"picture": f, "remark_at_building": RaB}
        self.patch_invalid(f"picture-of-remark/")

    def test_patch_error_picture_of_remark(self):
        RaB = insert_dummy_remark_at_building()
        self.data1 = {"picture": f, "remark_at_building": RaB}
        self.data2 = {"picture": f2, "remark_at_building": RaB}
        self.patch_error(f"picture-of-remark/")

    def test_remove_picture_of_remark(self):
        p_id = insert_dummy_picture_of_remark(f)
        self.remove(f"picture-of-remark/{p_id}")

    def test_remove_non_existing_picture_of_remark(self):
        self.remove_invalid("picture_of_remark/")


class PictureOfRemarkAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_picture_of_remark_list(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        self.list_view("picture-of-remark/", codes)

    def test_insert_picture_of_remark(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 403,
            "Syndic": 403
        }
        RaB = insert_dummy_remark_at_building()
        specialStudent = RemarkAtBuilding.objects.get(id=RaB).student_on_tour.student.id
        self.data1 = {"picture": f, "remark_at_building": RaB}
        self.insert_view("picture-of-remark/", codes, special=[(specialStudent, 201)])

    def test_get_picture_of_remark(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        PoR_id = insert_dummy_picture_of_remark(f)
        specialStudent = PictureOfRemark.objects.get(id=PoR_id).remark_at_building.student_on_tour.student.id
        self.get_view(f"picture-of-remark/{PoR_id}", codes, special=[(specialStudent, 200)])

    def test_patch_picture_of_remark(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        PoR = insert_dummy_picture_of_remark(f)
        RaB = insert_dummy_remark_at_building()
        specialStudent = RemarkAtBuilding.objects.get(id=RaB).student_on_tour.student.id
        self.data1 = {"picture": f, "remark_at_building": RaB}
        self.patch_view(f"picture-of-remark/{PoR}", codes, special=[(specialStudent, 200)])

    def test_remove_picture_of_remark(self):
        # testing the special case where the student of the tour removes the instance is very difficult,
        # since there are always new instances created and there is no way to access them from here
        def create():
            return insert_dummy_picture_of_remark(f)

        codes = {
            "Default": 403,
            "Admin": 204,
            "Superstudent": 204,
            "Student": 403,
            "Syndic": 403
        }
        self.remove_view("picture-of-remark/", codes, create=create)
