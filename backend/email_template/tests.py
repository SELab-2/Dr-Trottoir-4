from base.models import EmailTemplate
from base.serializers import EmailTemplateSerializer
from util.data_generators import insert_dummy_email_template
from util.test_tools import BaseTest, BaseAuthTest


class EmailTemplateTests(BaseTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_empty_email_template_list(self):
        self.empty_list("email-template/")

    def test_insert_email_template(self):
        self.data1 = {
            "name": "testTemplate",
            "template": "<p>{{name}<p>"
        }
        self.insert("email-template/")

    def test_insert_dupe_email_template(self):
        self.data1 = {
            "name": "testTemplate",
            "template": "<p>{{name}<p>"
        }
        self.insert_dupe("email-template/")

    def test_get_email_template(self):
        et_id = insert_dummy_email_template()
        data = EmailTemplateSerializer(EmailTemplate.objects.get(id=et_id)).data
        self.get(f"email-template/{et_id}", data)

    def test_get_non_existing(self):
        self.get_non_existent("email-template/")

    def test_patch_email_template(self):
        et_id = insert_dummy_email_template()
        self.data1 = {
            "name": "testTemplate2",
            "template": "<p>{{name}<p>"
        }
        self.patch(f"email-template/{et_id}")

    def test_patch_invalid_email_template(self):
        self.data1 = {
            "name": "testTemplate",
            "template": "<p>{{name}<p>"
        }
        self.patch_invalid("email-template/")

    def test_patch_error_email_template(self):
        self.data1 = {
            "name": "testTemplate",
            "template": "<p>{{name}<p>"
        }
        self.data2 = {
            "name": "testTemplate2",
            "template": "<p>{{name}<p>"
        }
        self.patch_error("email-template/")

    def test_remove_email_template(self):
        et_id = insert_dummy_email_template()
        self.remove(f"email-template/{et_id}")

    def test_remove_nonexistent_email_template(self):
        self.remove_invalid("email-template/")


class BuildingOnTourAuthorizationTests(BaseAuthTest):
    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_email_template_list(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        self.list_view("building-comment/", codes)

    def test_insert_email_template(self):
        codes = {
            "Default": 403,
            "Admin": 201,
            "Superstudent": 201,
            "Student": 403,
            "Syndic": 403
        }
        self.data1 = {
            "name": "testTemplate",
            "template": "<p>{{name}<p>"
        }
        self.insert_view("email-template/", codes)

    def test_get_email_template(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        et_id = insert_dummy_email_template()
        self.get_view(f"email-template/{et_id}", codes)

    def test_patch_email_template(self):
        codes = {
            "Default": 403,
            "Admin": 200,
            "Superstudent": 200,
            "Student": 403,
            "Syndic": 403
        }
        self.data2 = {
            "name": "testTemplate2",
            "template": "<p>{{name}<p>"
        }
        et_id = insert_dummy_email_template()
        self.patch_view(f"email-template/{et_id}", codes)

    def test_remove_email_template(self):
        def create():
            return insert_dummy_email_template()

        codes = {
            "Default": 403,
            "Admin": 204,
            "Superstudent": 204,
            "Student": 403,
            "Syndic": 403
        }
        self.remove_view("email-template/", codes, create=create)
