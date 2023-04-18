import json
from copy import deepcopy

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from base.models import User
from base.test_settings import backend_url, roles
from util.data_generators import createUser


def get_authenticated_client(role="admin"):
    user = createUser(role)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def errorMessage(name, expected, got):
    return f"[TEST FAILED]\tname: {name}\tgot: {got} (type: {type(got)})\texpected: {expected} (type: {type(expected)})"


class BaseTest(TestCase):
    data1 = None
    data2 = None

    def setUp(self):
        self.client = get_authenticated_client()

    def empty_list(self, url):
        resp = self.client.get(backend_url + "/" + url + "all/", follow=True)
        assert resp.status_code == 200, errorMessage("empty_list", 200, resp.status_code)
        data = [resp.data[e] for e in resp.data]
        assert len(data) == 0, errorMessage("empty_list", 0, len(data))

    def insert(self, url, excluded=None):
        if excluded is None:
            excluded = []
        assert self.data1 is not None, "no data found"
        data = self.data1
        if "region" in self.data1:
            data = json.dumps(self.data1)
            resp = self.client.post(backend_url + "/" + url, data, content_type="application/json", follow=True)
        else:
            resp = self.client.post(backend_url + "/" + url, data, follow=True)
        assert resp.status_code == 201, errorMessage("insert", 201, resp.status_code)
        for key in self.data1:
            if key in excluded:
                continue
            assert key in resp.data, errorMessage("insert", key, None)
            if type(self.data1[key]) == InMemoryUploadedFile:
                continue
            assert self.data1[key] == resp.data[key], errorMessage(
                f"insert (key:{key})", self.data1[key], resp.data[key]
            )
        assert "id" in resp.data, errorMessage("insert", "id", None)

    def insert_empty(self, url):
        resp = self.client.post(backend_url + "/" + url, {}, follow=True)
        print(resp)
        assert resp.status_code == 400, errorMessage("insert_empty", 400, resp.status_code)

    def insert_dupe(self, url, special=None):
        assert self.data1 is not None, "no data found"
        if "region" in self.data1:
            data = json.dumps(self.data1)
            _ = self.client.post(backend_url + "/" + url, data, content_type="application/json", follow=True)
        else:
            _ = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        # _ = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        if "region" in self.data1:
            data = json.dumps(self.data1)
            response = self.client.post(backend_url + "/" + url, data, content_type="application/json", follow=True)
        else:
            response = self.client.post(backend_url + "/" + url, self.data1, follow=True)

        # response = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        if special is None:
            assert response.status_code == 400, errorMessage("insert_dupe", 400, response.status_code)
        else:
            assert response.status_code == special, errorMessage("insert_dupe", special, response.status_code)

    def get(self, url, data):
        response2 = self.client.get(backend_url + "/" + url, follow=True)
        assert response2.status_code == 200, errorMessage("get", 200, response2.status_code)
        for key in data:
            # all data should be present
            assert key in response2.data, errorMessage("get", key, None)
            if type(data[key]) == InMemoryUploadedFile:
                continue
            assert data[key] == response2.data[key], errorMessage("get (key:{key})", data[key], response2.data[key])
        # an ID should be present
        assert "id" in response2.data, errorMessage("insert", "id", None)

    def get_non_existent(self, url):
        resp = self.client.get(backend_url + "/" + url + "1234567", follow=True)
        assert resp.status_code == 404, errorMessage("get_non_existent", 404, resp.status_code)

    def patch(self, url, special=None, excluded=None):
        if excluded is None:
            excluded = []
        if special is None:
            special = []
        assert self.data1 is not None, "no data found"
        if "region" in self.data1:
            data = json.dumps(self.data1)
            response2 = self.client.patch(backend_url + "/" + url, data, content_type="application/json", follow=True)
        else:
            response2 = self.client.patch(backend_url + "/" + url, self.data1, follow=True)
        # response2 = self.client.patch(backend_url + "/" + url, self.data1, follow=True)
        assert response2.status_code == 200, errorMessage("patch", 200, response2.status_code)
        response3 = self.client.get(backend_url + "/" + url, follow=True)
        checked = []
        for key, value in special:
            if key in excluded:
                continue
            assert key in response3.data, errorMessage("patch", key, None)
            assert value == response3.data[key], errorMessage("patch", value, response3.data[key])
            checked.append(key)
        for key in self.data1:
            if key in checked or key in excluded:
                continue
            # all data should be present
            assert key in response3.data, errorMessage("patch", key, None)
            if type(self.data1[key]) == InMemoryUploadedFile:
                continue
            assert self.data1[key] == response3.data[key], errorMessage("patch", self.data1[key], response3.data[key])
        assert response3.status_code == 200, errorMessage("patch", 200, response3.status_code)
        assert "id" in response3.data, errorMessage("patch", "id", None)

    def patch_invalid(self, url):
        if "region" in self.data1:
            data = json.dumps(self.data1)
            response2 = self.client.patch(backend_url + "/" + url + "123434687658/", data, content_type="application/json", follow=True)
        else:
            response2 = self.client.patch(backend_url + "/" + url + "123434687658/", self.data1, follow=True)
        # response2 = self.client.patch(backend_url + "/" + url + "123434687658/", self.data1, follow=True)
        assert response2.status_code == 404, errorMessage("patch_invalid", 404, response2.status_code)

    def patch_error(self, url, special=None):
        assert self.data1 is not None, "no data found"
        assert self.data2 is not None, "no data found"
        # taking a deepcopy to fix file issues when uploading pictures
        backup = deepcopy(self.data2)
        if "region" in self.data1:
            data = json.dumps(self.data1)
            response1 = self.client.post(backend_url + "/" + url, data,
                                          content_type="application/json", follow=True)
        else:
            response1 = self.client.post(backend_url + "/" + url, self.data1, follow=True)

        # response1 = self.client.post(backend_url + "/" + url, self.data1, follow=True)
        if "region" in self.data2:
            data = json.dumps(self.data2)
            _ = self.client.post(backend_url + "/" + url, data,
                                          content_type="application/json", follow=True)
        else:
            _ = self.client.post(backend_url + "/" + url, self.data2, follow=True)

        # _ = self.client.post(backend_url + "/" + url, self.data2, follow=True)
        assert response1.status_code == 201, errorMessage("patch_error", 201, response1.status_code)
        result_id = response1.data["id"]
        if "region" in backup:
            data = json.dumps(backup)
            response2 = self.client.patch(backend_url + "/" + url + f"{result_id}", data,
                                          content_type="application/json", follow=True)
        else:
            response2 = self.client.patch(backend_url + "/" + url + f"{result_id}", backup, follow=True)

        # response2 = self.client.patch(backend_url + "/" + url + f"{result_id}/", backup, follow=True)
        if special is None:
            assert response2.status_code == 400, errorMessage("patch_error", 400, response2.status_code)
        else:
            assert response2.status_code == special, errorMessage("patch_error", special, response2.status_code)

    def remove(self, url, special=None):
        response2 = self.client.delete(backend_url + "/" + url, follow=True)
        assert response2.status_code == 204, errorMessage("remove", 204, response2.status_code)
        response3 = self.client.get(backend_url + "/" + url, follow=True)
        if special is not None:
            assert response3.status_code == special, errorMessage("remove", special, response3.status_code)
        else:
            assert response3.status_code == 404, errorMessage("remove", 404, response3.status_code)

    def remove_invalid(self, url):
        response2 = self.client.delete(backend_url + "/" + url + "123434687658", follow=True)
        assert response2.status_code == 404, errorMessage("remove_invalid", 404, response2.status_code)


def auth_error_message(name, role, got, expected):
    return f"[TEST FAILED]\tname: {name}\trole: {role}\tcode: {got} (expected {expected})"


class BaseAuthTest(TestCase):
    data1 = None

    def list_view(self, url, codes):
        for role in roles:
            client = get_authenticated_client(role)
            resp = client.get(backend_url + "/" + url + "all/")
            assert resp.status_code == codes[role], auth_error_message("list_view", role, resp.status_code, codes[role])

    def insert_view(self, url, codes, special=None):
        if special is None:
            special = []
        adminClient = get_authenticated_client()
        for role in roles:
            client = get_authenticated_client(role)
            if "region" in self.data1:
                data = json.dumps(self.data1)
                resp = client.post(backend_url + "/" + url, data,
                                              content_type="application/json", follow=True)
            else:
                resp = client.post(backend_url + "/" + url, self.data1, follow=True)

            # resp = client.post(backend_url + "/" + url, self.data1, follow=True)
            assert resp.status_code == codes[role], auth_error_message(
                "insert_view", role, resp.status_code, codes[role]
            )
            if resp.status_code == 201:
                result_id = resp.data["id"]
                _ = adminClient.delete(backend_url + "/" + url + str(result_id))
        for user_id, result in special:
            user = User.objects.filter(id=user_id).first()  # there should only be 1
            if not User:
                raise ValueError("user not valid")
            client = APIClient()
            client.force_authenticate(user=user)
            # response2 = client.post(backend_url + "/" + url, self.data1, follow=True)
            if "region" in self.data1:
                data = json.dumps(self.data1)
                response2 = client.post(backend_url + "/" + url, data,
                                              content_type="application/json", follow=True)
            else:
                response2 = client.post(backend_url + "/" + url, self.data1, follow=True)
            assert response2.status_code == result, auth_error_message(
                "insert_view (special case)", user.role.name, response2.status_code, result
            )
            if response2.status_code == 201:
                result_id = response2.data["id"]
                _ = adminClient.delete(backend_url + "/" + url + str(result_id))

    def get_view(self, url, codes, special=None):
        if special is None:
            special = []
        for role in roles:
            client = get_authenticated_client(role)
            response2 = client.get(backend_url + "/" + url, follow=True)
            assert response2.status_code == codes[role], auth_error_message(
                "get_view", role, response2.status_code, codes[role]
            )
        for user_id, result in special:
            user = User.objects.filter(id=user_id).first()  # there should only be 1
            if not User:
                raise ValueError("user not valid")
            client = APIClient()
            client.force_authenticate(user=user)
            response2 = client.get(backend_url + "/" + url, follow=True)
            assert response2.status_code == result, auth_error_message(
                "get_view (special case)", user.role.name, response2.status_code, result
            )

    def patch_view(self, url, codes, special=None):
        if special is None:
            special = []
        for role in roles:
            client = get_authenticated_client(role)
            if "region" in self.data1:
                data = json.dumps(self.data1)
                response2 = client.patch(backend_url + "/" + url, data,
                                              content_type="application/json", follow=True)
            else:
                response2 = client.patch(backend_url + "/" + url, self.data1, follow=True)
            # response2 = client.patch(backend_url + "/" + url, self.data1, follow=True)
            assert response2.status_code == codes[role], auth_error_message(
                "patch_view", role, response2.status_code, codes[role]
            )
        for user_id, result in special:
            user = User.objects.filter(id=user_id).first()  # there should only be 1
            if not User:
                raise ValueError("user not valid")
            client = APIClient()
            client.force_authenticate(user=user)
            if "region" in self.data1:
                data = json.dumps(self.data1)
                response2 = client.patch(backend_url + "/" + url, data,
                                              content_type="application/json", follow=True)
            else:
                response2 = client.patch(backend_url + "/" + url, self.data1, follow=True)
            # response2 = client.patch(backend_url + "/" + url, self.data1, follow=True)
            assert response2.status_code == result, auth_error_message(
                "patch_view (special case)", user.role.name, response2.status_code, result
            )

    def remove_view(self, url, codes, create):
        exists = False
        instance_id = -1
        for role in roles:
            if not exists:
                instance_id = create()
            # try to remove as `role`
            client = get_authenticated_client(role)
            response2 = client.delete(backend_url + "/" + url + f"{instance_id}/", follow=True)
            assert response2.status_code == codes[role], auth_error_message(
                "remove_view", role, response2.status_code, codes[role]
            )
            exists = codes[role] != 204
