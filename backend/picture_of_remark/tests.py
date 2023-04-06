from base.models import PictureOfRemark
from base.serializers import PictureOfRemarkSerializer
from util.data_generators import insert_dummy_remark_at_building, createMemoryFile, insert_dummy_picture_of_remark
from util.test_tools import BaseTest

f = createMemoryFile("./picture_of_remark/scrambled1.png")


class PictureOfRemarkTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_picture_of_remark(self):
        self.empty_list("picture-of-remark/")

    def test_insert_picture_of_remark(self):
        self.data1 = {"picture": f, "remark_at_building": insert_dummy_remark_at_building()}
        self.insert("picture-of-remark/")

    def test_insert_dupe_picture_of_remark(self):
        self.data1 = {"picture": f, "remark_at_building": insert_dummy_remark_at_building()}
        self.insert_dupe("picture-of-remark/")

    def test_get_picture_of_remark(self):
        p_id = insert_dummy_picture_of_remark(picture=f)
        data = PictureOfRemarkSerializer(PictureOfRemark.objects.get(id=p_id)).data
        self.get(f"picture-of-remark/{p_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("picture-of-remark/")

    # def test_patch_picture_of_remark(self):
        # p_id = insert_dummy_picture_of_remark(f)
        # # TODO: add new picture for patch!
        # patch_data = {"picture": f}
        # # TODO: make the following code generic (Super class): super().test_patch(id, patch_data)
        # resp1 = self.client.patch(self.base_url + p_id, patch_data)
        # assert resp1.status_code == 200
        # resp2 = self.client.get(self.base_url + p_id)
        # assert resp2.status_code == 200
        # for k in patch_data:
        #     assert k in resp2.data
        # assert "id" in resp2.data

    def test_remove_picture_of_remark(self):
        p_id = insert_dummy_picture_of_remark(f)
        self.remove(f"picture-of-remark/{p_id}")

    def test_remove_non_existing_picture_of_remark(self):
        self.remove_invalid("picture_of_remark")
