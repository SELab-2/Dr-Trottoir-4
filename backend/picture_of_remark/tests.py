from base.models import PictureOfRemark
from base.serializers import PictureOfRemarkSerializer
from util.data_generators import insert_dummy_remark_at_building, createMemoryFile, insert_dummy_picture_of_remark
from util.test_tools import BaseTest

f = createMemoryFile("./picture_of_remark/scrambled1.png")
f2 = createMemoryFile("./picture_of_remark/scrambled2.png")


class PictureOfRemarkTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_picture_of_remark(self):
        self.empty_list("picture-of-remark/")

    def test_insert_picture_of_remark(self):
        self.data1 = {"picture": f, "remark_at_building": insert_dummy_remark_at_building()}
        print(f)
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
        self.remove_invalid("picture_of_remark")
