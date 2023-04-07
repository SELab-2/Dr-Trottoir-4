from django.contrib.auth import get_user_model
from django.test import TestCase

from base.models import User
from base.serializers import UserSerializer
from util.data_generators import insert_dummy_region, insert_dummy_role, insert_test_user
from util.test_tools import BaseTest


class UsersManagersTests(TestCase):
    def test_create_user(self):
        User = get_user_model()
        user = User.objects.create_user(email="normal@user.com", password="foo")
        self.assertEqual(user.email, "normal@user.com")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        try:
            # username is None for the AbstractUser option
            # username does not exist for the AbstractBaseUser option
            self.assertIsNone(user.username)
        except AttributeError:
            pass
        with self.assertRaises(TypeError):
            User.objects.create_user()
        with self.assertRaises(TypeError):
            User.objects.create_user(email="")
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="foo")

    def test_create_superuser(self):
        User = get_user_model()
        admin_user = User.objects.create_superuser(email="super@user.com", password="foo")
        self.assertEqual(admin_user.email, "super@user.com")
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        try:
            # username is None for the AbstractUser option
            # username does not exist for the AbstractBaseUser option
            self.assertIsNone(admin_user.username)
        except AttributeError:
            pass
        with self.assertRaises(ValueError):
            User.objects.create_superuser(email="super@user.com", password="foo", is_superuser=False)


class UserTests(BaseTest):

    def __init__(self, methodName="runTest"):
        super().__init__(methodName)

    def test_insert_user(self):
        G_id = insert_dummy_region("Gent")
        B_id = insert_dummy_region("Brugge")
        R_id = insert_dummy_role("admin")
        self.data1 = {
            "username": "testUser",
            "email": "testuser@example.com",
            "is_staff": True,
            "is_active": False,
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "+32487172529",
            "role": R_id,
            "region": [
                G_id,
                B_id,
            ],
            "password": "testPassword"
        }
        self.insert("user/", excluded=[
            "username",
            "is_staff",
            "password"
        ])

    def test_insert_dupe(self):
        G_id = insert_dummy_region("Gent")
        B_id = insert_dummy_region("Brugge")
        R_id = insert_dummy_role("admin")
        self.data1 = {
            "username": "testUser",
            "email": "testuser@example.com",
            "is_staff": True,
            "is_active": False,
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "+32487172529",
            "role": R_id,
            "region": [
                G_id,
                B_id,
            ],
            "password": "testPassword"
        }
        self.insert_dupe("user/")

    def test_get_user(self):
        u = insert_test_user()
        data = UserSerializer(User.objects.get(id=u)).data
        self.get(f"user/{u}", data)

    def test_get_non_existing(self):
        self.get_non_existent("user/")

    def test_patch_user(self):
        u = insert_test_user()
        B_id = insert_dummy_region("Brugge")
        R_id = insert_dummy_role("student")
        self.data1 = {
            "username": "testUserfdsq",
            "email": "testuserfdsq@example.com",
            "is_staff": False,
            "is_active": True,
            "first_name": "Test1",
            "last_name": "User1",
            "phone_number": "+32487172525",
            "role": R_id,
            "region": [
                B_id,
            ],
            "password": "testPassword1"
        }
        self.patch(f"user/{u}")