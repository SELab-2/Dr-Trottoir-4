from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from phonenumber_field.modelfields import PhoneNumberField
from rest_framework.authtoken.models import Token
from base.managers import UserManager


class Region(models.Model):
    region = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.region


# Catches the post_save signal (in signals.py) and creates a user token if not yet created
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class User(AbstractBaseUser, PermissionsMixin):
    username = None
    # extra fields for authentication
    email = models.EmailField(_('email address'), unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'  # there is a username field and a password field
    REQUIRED_FIELDS = ['firstname', 'lastname', 'phone_number', 'role']

    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)
    phone_number = PhoneNumberField(region='BE')
    region = models.ManyToManyField(Region)

    STUDENT = 'ST'
    SUPERSTUDENT = 'SS'
    ADMIN = 'AD'
    SYNDIC = 'SY'
    ROLES = [
        (STUDENT, 'Student'),
        (SUPERSTUDENT, 'Superstudent'),
        (ADMIN, 'Admin'),
        (SYNDIC, 'Syndic')
    ]
    role = models.CharField(
        max_length=2,
        choices=ROLES)

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class Building(models.Model):
    city = models.CharField(max_length=40)
    postal_code = models.CharField(max_length=10)
    street = models.CharField(max_length=60)
    house_number = models.CharField(max_length=10)
    client_number = models.CharField(max_length=40, blank=True, null=True)
    duration = models.TimeField(default='00:00')
    syndic = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        # TODO: Check if this shouldn't be an ID
        unique_together = ('city', 'postal_code', 'street', 'house_number')

    def __str__(self):
        return f"{self.street} {self.house_number}, {self.city} {self.postal_code}"


class BuildingURL(models.Model):
    url = models.CharField(max_length=2048)
    firstname_resident = models.CharField(max_length=40)
    lastname_resident = models.CharField(max_length=40)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    class Meta:
        # TODO: Why not an ID?
        unique_together = ('url', 'building_id')

    def __str__(self):
        return f"{self.firstname_resident} {self.lastname_resident} : {self.url}"


class GarbageCollection(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    date = models.DateField()

    GFT = 'GFT'
    GLAS = 'GLS'
    GROF_VUIL = 'GRF'
    KERSTBOMEN = 'KER'
    PAPIER = 'PAP'
    PMD = 'PMD'
    RESTAFVAL = 'RES'
    GARBAGE = [
        (GFT, 'GFT'),
        (GLAS, 'Glas'),
        (GROF_VUIL, 'Grof vuil'),
        (KERSTBOMEN, 'Kerstbomen'),
        (PAPIER, 'Papier'),
        (PMD, 'PMD'),
        (RESTAFVAL, 'Restafval')
    ]
    garbage_type = models.CharField(
        max_length=3,
        choices=GARBAGE)

    def __str__(self):
        return f"{self.garbage_type} op {self.date} voor {self.building_id}"

    class Meta:
        unique_together = ('building_id', 'garbage_type', 'date')


class Tour(models.Model):
    name = models.CharField(max_length=40)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, blank=True, null=True)
    modified_at = models.DateTimeField()

    def __str__(self):
        return f"{self.name} in regio {self.region}"


class BuildingOnTour(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    index = models.IntegerField()

    def __str__(self):
        return f"{self.building} op ronde {self.tour}, index: {self.index}"

    class Meta:
        unique_together = ('index', 'tour')


class StudentAtBuildingOnTour(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    date = models.DateField()
    student = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return f"{self.student} bij {self.building} op {self.tour} op {self.date}"


class PictureBuilding(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    picture_name = models.CharField(max_length=2048)
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField()

    AANKOMST = 'AA'
    BINNEN = 'BI'
    VERTREK = 'VE'
    OPMERKING = 'OP'

    TYPE = [
        (AANKOMST, 'Aankomst'),
        (BINNEN, 'Binnen'),
        (VERTREK, 'Vertrek'),
        (OPMERKING, 'Opmerking')
    ]

    type = models.CharField(
        max_length=2,
        choices=TYPE)

    def __str__(self):
        return f"{self.type} = {self.picture_name} bij {self.building} ({self.timestamp}): {self.description}"


class Manual(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    version_number = models.IntegerField()
    filename = models.CharField(max_length=2048)

    def __str__(self):
        return f"Handleiding: {self.filename} (versie {self.version_number}) voor {self.building}"

    class Meta:
        unique_together = ('building_id', 'version_number')
