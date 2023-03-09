from django.contrib.auth.models import PermissionsMixin
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from phonenumber_field.modelfields import PhoneNumberField
from rest_framework.authtoken.models import Token
from users.managers import UserManager
from django.core.exceptions import ValidationError


class Region(models.Model):
    region = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.region


# Catches the post_save signal (in signals.py) and creates a user token if not yet created
# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)


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
    region = models.ManyToManyField(Region, blank=True)

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
    name = models.CharField(max_length=100, blank=True, null=True)

    '''
    Only a syndic can own a building, not a student.
    '''

    def clean(self):
        super().clean()
        user = self.syndic
        print(user)
        if user.role != 'SY':
            raise ValidationError("User must be a syndic to create a building")

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower('city'),
                Lower('street'),
                Lower('postal_code'),
                Lower('house_number'),
                name='address_unique',
            ),
        ]

    def __str__(self):
        return f"{self.street} {self.house_number}, {self.city} {self.postal_code}"


class BuildingURL(models.Model):
    url = models.CharField(max_length=2048, unique=True)
    firstname_resident = models.CharField(max_length=40)
    lastname_resident = models.CharField(max_length=40)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)

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
        return f"{self.garbage_type} op {self.date} voor {self.building}"

    class Meta:
        constraints = [
            UniqueConstraint(
                'building',
                Lower('garbage_type'),
                'date',
                name='garbage_collection_unique',
            ),
        ]


class Tour(models.Model):
    name = models.CharField(max_length=40)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, blank=True, null=True)
    modified_at = models.DateTimeField()

    def __str__(self):
        return f"{self.name} in regio {self.region}"

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower('name'),
                'region',
                name='unique_tour',
            ),
        ]


class BuildingOnTour(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    index = models.PositiveIntegerField()

    '''
    The region of a tour and of a building needs to be the same.
    '''

    def clean(self):
        super().clean()
        tour_region = self.tour.region
        building_region = self.building.region
        if tour_region != building_region:
            raise ValidationError(f"The tour ({tour_region}) and building ({building_region}) "
                                  f"correspond to different region. ")

    def __str__(self):
        return f"{self.building} op ronde {self.tour}, index: {self.index}"

    class Meta:
        constraints = [
            UniqueConstraint(
                'index',
                'tour',
                name='unique_index_on_tour',
            ),
            UniqueConstraint(
                'building',
                'tour',
                name='unique_building_on_tour',
            )
        ]


class StudentAtBuildingOnTour(models.Model):
    building_on_tour = models.ForeignKey(BuildingOnTour, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    '''
    A syndic can't do tours, so we need to check that a student assigned to the building on the tour is not a syndic.
    Also, the student that does the tour needs to have selected the region where the building is located.
    '''

    def clean(self):
        super().clean()
        user = self.student
        if user.role == 'SY':
            raise ValidationError("Syndic can't do tours.")
        building_on_tour_region = self.building_on_tour.tour.region
        if not self.student.region.all().filter(region=building_on_tour_region).exists():
            raise ValidationError(f"User doesn't tour the region {building_on_tour_region}"
                                  f" where the building is located")

    class Meta:
        constraints = [
            UniqueConstraint(
                'building_on_tour',
                'date',
                'student',
                name='unique_student_at_building_on_tour',
            ),
        ]

    def __str__(self):
        return f"{self.student} bij {self.building_on_tour} op {self.date}"


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

    class Meta:
        constraints = [
            UniqueConstraint(
                'building',
                Lower('picture_name'),
                Lower('description'),
                'timestamp',
                name='unique_picture_building',
            ),
        ]

    def __str__(self):
        return f"{self.type} = {self.picture_name} bij {self.building} ({self.timestamp}): {self.description}"


class Manual(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField()
    filename = models.CharField(max_length=2048)

    def __str__(self):
        return f"Handleiding: {self.filename} (versie {self.version_number}) voor {self.building}"

    class Meta:
        constraints = [
            UniqueConstraint(
                'building_id',
                'version_number',
                name='unique_manual',
            ),
        ]
