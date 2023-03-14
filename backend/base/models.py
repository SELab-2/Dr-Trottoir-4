from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _
from django_random_id_model import RandomIDModel
from phonenumber_field.modelfields import PhoneNumberField

from users.managers import UserManager


def _check_for_present_keys(instance, keys_iterable):
    for key in keys_iterable:
        if not vars(instance)[key]:
            raise ValidationError(f"Tried to access {key} but it was not found in object")


class Region(models.Model):
    region = models.CharField(max_length=40, unique=True, error_messages={'unique': "Deze regio bestaat al."})

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
    email = models.EmailField(_('email address'), unique=True,
                              error_messages={'unique': "Er is al een gebruiker met deze email."})
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'  # there is a username field and a password field
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone_number', 'role']

    first_name = models.CharField(max_length=40)
    last_name = models.CharField(max_length=40)
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

        # If this is not checked, `self.syndic` will cause an internal server error 500
        _check_for_present_keys(self, {"syndic_id"})

        user = self.syndic
        print(user)
        if user.role != 'SY':
            raise ValidationError("Enkel een gebruiker met rol \"syndicus\" kan een gebouw hebben.")

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower('city'),
                Lower('street'),
                Lower('postal_code'),
                Lower('house_number'),
                name='address_unique',
                violation_error_message='Er is al een gebouw met dit adres.'
            ),
        ]

    def __str__(self):
        return f"{self.street} {self.house_number}, {self.city} {self.postal_code}"


class BuildingURL(RandomIDModel):
    first_name_resident = models.CharField(max_length=40)
    last_name_resident = models.CharField(max_length=40)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.first_name_resident} {self.last_name_resident} : {self.id}"


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
                violation_error_message='Dit soort afval wordt al op deze dag bij het gebouw afgehaald.'
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
                violation_error_message='Er bestaat al een ronde met dezelfde naam in de regio.'
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

        _check_for_present_keys(self, {"tour_id", "building_id", "index", "index"})

        tour_region = self.tour.region
        building_region = self.building.region
        if tour_region != building_region:
            raise ValidationError(f"De regio's van de ronde ({tour_region}) en gebouw ({building_region}) "
                                  f"zijn verschillend.")

    def __str__(self):
        return f"{self.building} op ronde {self.tour}, index: {self.index}"

    class Meta:
        constraints = [
            UniqueConstraint(
                'index',
                'tour',
                name='unique_index_on_tour',
                violation_error_message='De ronde heeft al een gebouw op deze index.'
            ),
            UniqueConstraint(
                'building',
                'tour',
                name='unique_building_on_tour',
                violation_error_message='Dit gebouw komt al voor op deze ronde.'
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
            raise ValidationError("Een syndicus kan geen rondes doen.")
        building_on_tour_region = self.building_on_tour.tour.region
        if not self.student.region.all().filter(region=building_on_tour_region).exists():
            raise ValidationError(
                f"Student ({user.email}) doet geen rondes in de regio van het gebouw ({building_on_tour_region}).")

    class Meta:
        constraints = [
            UniqueConstraint(
                'building_on_tour',
                'date',
                'student',
                name='unique_student_at_building_on_tour',
                violation_error_message='De student doet op deze dag al de ronde.'
            ),
        ]

    def __str__(self):
        return f"{self.student} bij {self.building_on_tour} op {self.date}"


class PictureBuilding(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    picture = models.ImageField(upload_to='building_pictures/', blank=True, null=True)
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
                Lower('picture'),
                Lower('description'),
                'timestamp',
                name='unique_picture_building',
                violation_error_message='Het gebouw heeft al hetzelfde soort foto op hetzelfde tijdstip.'
            ),
        ]

    def __str__(self):
        return f"{self.type} = {str(self.picture).split('/')[-1]} bij {self.building} ({self.timestamp}): {self.description}"


class Manual(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField(default=0)
    file = models.FileField(upload_to='building_manuals/', blank=True, null=True)

    def __str__(self):
        return f"Handleiding: {str(self.file).split('/')[-1]} (versie {self.version_number}) voor {self.building}"

    def clean(self):
        super().clean()
        _check_for_present_keys(self, {"building_id", "file"})
        # If no version number is given, the new version number should be the highest + 1
        # If only version numbers 1, 2 and 3 are in the database, a version number of e.g. 3000 is not permitted

        manuals = Manual.objects.filter(building_id=self.building_id)
        version_numbers = {manual.version_number for manual in manuals}
        version_numbers.add(-1)
        max_version_number = max(version_numbers)

        if self.version_number == 0 or self.version_number > max_version_number + 1 or self.version_number in version_numbers:
            self.version_number = max_version_number + 1

    class Meta:
        constraints = [
            # Het is sowieso uniek door de code in `clean`, het wordt nu wel 'silent' opgelost
            # UniqueConstraint(
            #    'building_id',
            #    'version_number',
            #    name='unique_manual',
            #    violation_error_message='Het gebouw heeft al een handleiding met dit versienummer.'
            # ),
        ]
