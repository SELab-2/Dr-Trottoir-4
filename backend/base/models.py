from datetime import date

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

from users.managers import UserManager

# sys.maxsize throws psycopg2.errors.NumericValueOutOfRange: integer out of range
# Set the max int manually
MAX_INT = 2**31 - 1


def _check_for_present_keys(instance, keys_iterable):
    for key in keys_iterable:
        if not vars(instance)[key]:
            raise ValidationError(f"Tried to access {key}, but it was not found in object")


class Region(models.Model):
    region = models.CharField(max_length=40, unique=True, error_messages={"unique": "Deze regio bestaat al."})

    def __str__(self):
        return self.region


# Catches the post_save signal (in signals.py) and creates a user token if not yet created
# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)


class Role(models.Model):
    name = models.CharField(max_length=20)
    rank = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} (rank: {self.rank})"

    def clean(self):
        super().clean()
        if Role.objects.count() != 0 and self.rank != MAX_INT:
            highest_rank = Role.objects.order_by("-rank").first().rank
            if self.rank > highest_rank + 1:
                raise ValidationError(f"The maximum rank allowed is {highest_rank + 1}.")

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower("name"),
                name="role_unique",
                violation_error_message="This role name already exists.",
            ),
        ]


class User(AbstractBaseUser, PermissionsMixin):
    username = None
    # extra fields for authentication
    email = models.EmailField(
        _("email address"),
        unique=True,
        error_messages={"unique": "A user already exists with this email."},
    )
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "email"  # there is a username field and a password field
    REQUIRED_FIELDS = ["first_name", "last_name", "phone_number", "role"]

    first_name = models.CharField(max_length=40)
    last_name = models.CharField(max_length=40)
    phone_number = PhoneNumberField(region="BE")
    region = models.ManyToManyField(Region)

    # This is the new role model
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class Lobby(models.Model):
    email = models.EmailField(
        _("email address"), unique=True, error_messages={"unique": "This email is already in the whitelist."}
    )
    # The verification code, preferably hashed
    verification_code = models.CharField(
        max_length=128, unique=True, error_messages={"unique": "This verification code already exists."}
    )

    def clean(self):
        _check_for_present_keys(self, {"email"})
        if User.objects.filter(email=self.email):
            raise ValidationError("Email already exists in database (the email is already linked to a user)")


class Building(models.Model):
    city = models.CharField(max_length=40)
    postal_code = models.CharField(max_length=10)
    street = models.CharField(max_length=60)
    house_number = models.PositiveIntegerField()
    bus = models.CharField(max_length=10, blank=True, null=True)
    client_number = models.CharField(max_length=40, blank=True, null=True)
    duration = models.TimeField(default="00:00")
    syndic = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    public_id = models.CharField(max_length=32, blank=True, null=True)

    """
    Only a syndic can own a building, not a student.
    """

    def clean(self):
        super().clean()

        # If this is not checked, `self.syndic` will cause an internal server error 500
        _check_for_present_keys(self, {"syndic_id"})

        if self.house_number == 0:
            raise ValidationError("The house number of the building must be positive and not zero.")

        user = self.syndic
        if user.role.name.lower() != "syndic":
            raise ValidationError('Only a user with role "syndic" can own a building.')

        # If a public_id exists, it should be unique
        if self.public_id:
            if Building.objects.filter(public_id=self.public_id):
                raise ValidationError(f"{self.public_id} already exists as public_id of another building")

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower("city"),
                Lower("street"),
                Lower("postal_code"),
                "house_number",
                Lower("bus"),
                name="address_unique",
                violation_error_message="A building with this address already exists.",
            ),
        ]

    def __str__(self):
        return f"{self.street} {self.house_number}, {self.city} {self.postal_code}"


class BuildingComment(models.Model):
    comment = models.TextField()
    date = models.DateTimeField()
    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    def __str__(self):
        return f"Comment: {self.comment} ({self.date}) for {self.building}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "building",
                Lower("comment"),
                "date",
                name="building_comment_unique",
                violation_error_message="This comment already exists, and was posted at the exact same time.",
            ),
        ]


class GarbageCollection(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    date = models.DateField()

    GFT = "GFT"
    GLAS = "GLS"
    GROF_VUIL = "GRF"
    KERSTBOMEN = "KER"
    PAPIER = "PAP"
    PMD = "PMD"
    RESTAFVAL = "RES"
    GARBAGE = [
        (GFT, "GFT"),
        (GLAS, "Glas"),
        (GROF_VUIL, "Grof vuil"),
        (KERSTBOMEN, "Kerstbomen"),
        (PAPIER, "Papier"),
        (PMD, "PMD"),
        (RESTAFVAL, "Restafval"),
    ]
    garbage_type = models.CharField(max_length=3, choices=GARBAGE)

    def __str__(self):
        return f"{self.garbage_type} on {self.date} at {self.building}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "building",
                Lower("garbage_type"),
                "date",
                name="garbage_collection_unique",
                violation_error_message="This type of garbage is already being collected on the same day for this "
                "building.",
            ),
        ]


class Tour(models.Model):
    name = models.CharField(max_length=40)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, blank=True, null=True)
    modified_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        super().clean()

        _check_for_present_keys(self, {"name", "region_id"})

        if not self.modified_at:
            self.modified_at = str(date.today())

    def __str__(self):
        return f"Tour {self.name} in region {self.region}"

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower("name"),
                "region",
                name="unique_tour",
                violation_error_message="There is already a tour with the same name in the region.",
            ),
        ]


class BuildingOnTour(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    index = models.PositiveIntegerField()

    """
    The region of a tour and of a building needs to be the same.
    """

    def clean(self):
        super().clean()

        _check_for_present_keys(self, {"tour_id", "building_id", "index"})

        tour_region = self.tour.region
        building_region = self.building.region
        if tour_region != building_region:
            raise ValidationError(
                f"The regions for tour ({tour_region}) en building ({building_region}) " f"are different."
            )

        nr_of_buildings = BuildingOnTour.objects.filter(tour=self.tour).count()
        if self.index > nr_of_buildings:
            raise ValidationError(f"The maximum allowed index for this building is {nr_of_buildings}")

    def __str__(self):
        return f"{self.building} on tour {self.tour}, index: {self.index}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "index",
                "tour",
                name="unique_index_on_tour",
                violation_error_message="The tour has already a building on this index.",
            ),
            UniqueConstraint(
                "building",
                "tour",
                name="unique_building_on_tour",
                violation_error_message="This building is already on this tour.",
            ),
        ]


class StudentAtBuildingOnTour(models.Model):
    building_on_tour = models.ForeignKey(BuildingOnTour, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    """
    A syndic can't do tours, so we need to check that a student assigned to the building on the tour is not a syndic.
    Also, the student that does the tour needs to have selected the region where the building is located.
    """

    def clean(self):
        super().clean()
        _check_for_present_keys(self, {"student_id", "building_on_tour_id", "date"})
        user = self.student
        if user.role.name.lower() == "syndic":
            raise ValidationError("A syndic can't do tours")
        building_on_tour_region = self.building_on_tour.tour.region
        if not self.student.region.all().filter(region=building_on_tour_region).exists():
            raise ValidationError(
                f"Student ({user.email}) doesn't do tours in this region ({building_on_tour_region})."
            )

    class Meta:
        constraints = [
            UniqueConstraint(
                "building_on_tour",
                "date",
                "student",
                name="unique_student_at_building_on_tour",
                violation_error_message="The student is already assigned to this tour on this date.",
            ),
        ]

    def __str__(self):
        return f"{self.student} at {self.building_on_tour} on {self.date}"


class PictureBuilding(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    picture = models.ImageField(upload_to="building_pictures/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField()

    AANKOMST = "AA"
    BINNEN = "BI"
    VERTREK = "VE"
    OPMERKING = "OP"

    TYPE = [
        (AANKOMST, "Aankomst"),
        (BINNEN, "Binnen"),
        (VERTREK, "Vertrek"),
        (OPMERKING, "Opmerking"),
    ]

    type = models.CharField(max_length=2, choices=TYPE)

    def clean(self):
        super().clean()
        _check_for_present_keys(self, {"building_id", "picture", "description", "timestamp"})

    class Meta:
        constraints = [
            UniqueConstraint(
                "building",
                Lower("picture"),
                Lower("description"),
                "timestamp",
                name="unique_picture_building",
                violation_error_message="The building already has the upload.",
            ),
        ]

    def __str__(self):
        return f"{self.type} = {str(self.picture).split('/')[-1]} at {self.building} ({self.timestamp}): {self.description}"


class Manual(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField(default=0)
    file = models.FileField(upload_to="building_manuals/", blank=True, null=True)

    def __str__(self):
        return f"Manual: {str(self.file).split('/')[-1]} (version {self.version_number}) for {self.building}"

    def clean(self):
        super().clean()
        _check_for_present_keys(self, {"building_id", "file"})
        # If no version number is given, the new version number should be the highest + 1
        # If only version numbers 1, 2 and 3 are in the database, a version number of e.g. 3000 is not permitted

        manuals = Manual.objects.filter(building_id=self.building_id)
        version_numbers = {manual.version_number for manual in manuals}
        version_numbers.add(-1)
        max_version_number = max(version_numbers)

        if (
            self.version_number == 0
            or self.version_number > max_version_number + 1
            or self.version_number in version_numbers
        ):
            self.version_number = max_version_number + 1

    class Meta:
        constraints = [
            UniqueConstraint(
                "building",
                "version_number",
                name="unique_manual",
                violation_error_message="The building already has a manual with the same version number",
            ),
        ]


class EmailTemplate(models.Model):
    name = models.CharField(max_length=40)
    template = models.TextField()

    def __str__(self):
        return f"Manual: {self.name}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "name",
                name="unique_template_name",
                violation_error_message="The name for this template already exists.",
            ),
        ]
