from datetime import date, datetime

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import UniqueConstraint, Q
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

from users.managers import UserManager

# sys.maxsize throws psycopg2.errors.NumericValueOutOfRange: integer out of range
# Set the max int manually
MAX_INT = 2**31 - 1


class Region(models.Model):
    region = models.CharField(max_length=40, unique=True, error_messages={"unique": _("This region already exists")})

    def __str__(self):
        return self.region


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
                raise ValidationError(
                    _("The maximum rank allowed is {highest_rank}.").format(highest_rank=highest_rank + 1)
                )

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower("name"),
                name="role_unique",
                violation_error_message=_("This role name already exists."),
            ),
        ]


class User(AbstractBaseUser, PermissionsMixin):
    username = None
    # extra fields for authentication
    email = models.EmailField(
        "email address",
        unique=True,
        error_messages={"unique": _("A user already exists with this email.")},
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
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class Lobby(models.Model):
    email = models.EmailField(
        "email address", unique=True, error_messages={"unique": _("This email is already in the lobby.")}
    )
    # The verification code, preferably hashed
    verification_code = models.CharField(
        max_length=128, unique=True, error_messages={"unique": _("This verification code already exists.")}
    )

    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    def clean(self):
        super().clean()

        users = User.objects.filter(email=self.email)
        if users:
            user = users[0]
            is_inactive = not user.is_active
            addendum = ""
            if is_inactive:
                addendum = _(
                    " This email belongs to an INACTIVE user. Instead of trying to register this user, you can simply reactivate the account."
                )
            raise ValidationError(
                _("Email already exists in database for a user (id: {user_id}).{addendum}").format(
                    user_id=user.id, addendum=addendum
                )
            )


class Building(models.Model):
    city = models.CharField(max_length=40)
    postal_code = models.CharField(max_length=10)
    street = models.CharField(max_length=60)
    house_number = models.PositiveIntegerField()
    bus = models.CharField(max_length=10, blank=True, null=False, default=_("No bus"))
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

        if self.house_number == 0:
            raise ValidationError(_("The house number of the building must be positive and not zero."))

        # With this if, a building is not required to have a syndic. If a syndic should be required, blank has to be False
        # If this if is removed, an internal server error will be thrown since youll try to access a non existing attribute of type 'NoneType'
        if self.syndic:
            user = self.syndic
            if user.role.name.lower() != "syndic":
                raise ValidationError(_('Only a user with role "syndic" can own a building.'))

        # If a public_id exists, it should be unique
        if self.public_id:
            if Building.objects.filter(public_id=self.public_id).filter(~Q(id=self.id)):
                raise ValidationError(
                    _("{public_id} already exists as public_id of another building").format(public_id=self.public_id)
                )

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower("city"),
                Lower("street"),
                Lower("postal_code"),
                "house_number",
                Lower("bus"),
                name="address_unique",
                violation_error_message=_("A building with this address already exists."),
            ),
        ]

    def __str__(self):
        return f"{self.street} {self.house_number}, {self.city} {self.postal_code}"


class BuildingComment(models.Model):
    comment = models.TextField()
    date = models.DateTimeField()
    building = models.ForeignKey(Building, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return f"Comment: {self.comment} ({self.date}) for {self.building}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "building",
                Lower("comment"),
                "date",
                name="building_comment_unique",
                violation_error_message=_("This comment already exists, and was posted at the exact same time."),
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
                violation_error_message=_(
                    "This type of garbage is already being collected on the same day for this building."
                ),
            ),
        ]


class Tour(models.Model):
    name = models.CharField(max_length=40)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, blank=True, null=True)
    modified_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        super().clean()

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
                violation_error_message=_("There is already a tour with the same name in the region."),
            ),
        ]


class BuildingOnTour(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, blank=False, null=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, blank=False, null=False)
    index = models.PositiveIntegerField(blank=False, null=False)

    """
    The region of a tour and of a building needs to be the same.
    """

    def clean(self):
        super().clean()

        # If the if statement fails, django will handle the errors correctly in a consistent way
        if self.tour_id and self.building_id:
            tour_region = self.tour.region
            building_region = self.building.region
            if tour_region != building_region:
                raise ValidationError(
                    _("The regions for tour ({tour_region}) and building ({building_region}) are different.").format(
                        tour_region=tour_region, building_region=building_region
                    ),
                )

    def __str__(self):
        return f"{self.building} on tour {self.tour}, index: {self.index}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "building",
                "tour",
                name="unique_building_on_tour",
                violation_error_message=_("This building is already on this tour."),
            ),
            UniqueConstraint(
                "index",
                "tour",
                name="unique_index_on_tour",
                violation_error_message=_("This index is already in use."),
            ),
        ]


"""
Links student to tours on a date
"""


class StudentOnTour(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    started_tour = models.DateTimeField(null=True, blank=True)
    completed_tour = models.DateTimeField(null=True, blank=True)
    current_building_index = models.IntegerField(default=0, blank=True)
    max_building_index = models.IntegerField(null=True, blank=True)  # gets set by a signal

    """
    A syndic can't do tours, so we need to check that a student assigned to the building on the tour is not a syndic.
    Also, the student that does the tour needs to have selected the region where the building is located.
    """

    def clean(self):
        super().clean()

        if self.student_id and self.tour_id:
            user = self.student
            if user.role.name.lower() == "syndic":
                raise ValidationError(_("A syndic can't do tours"))
            tour_region = self.tour.region
            if not self.student.region.all().filter(region=tour_region).exists():
                raise ValidationError(
                    _("Student ({user_email}) doesn't do tours in this region ({tour_region}).").format(
                        user_email=user.email, tour_region=tour_region
                    )
                )

        if self.started_tour and self.completed_tour:
            self.started_tour = self.started_tour.astimezone()
            self.completed_tour = self.completed_tour.astimezone()

            if not self.completed_tour > self.started_tour:
                raise ValidationError(f"Time of completion must come after time of starting the tour.")
        elif self.completed_tour:
            raise ValidationError(f"Started tour time must be set before completion time.")

    class Meta:
        constraints = [
            UniqueConstraint(
                "tour",
                "date",
                "student",
                name="unique_student_on_tour",
                violation_error_message=_("The student is already assigned to this tour on this date."),
            ),
        ]

    def __str__(self):
        return f"{self.student} at {self.tour} on {self.date}"


class RemarkAtBuilding(models.Model):
    student_on_tour = models.ForeignKey(StudentOnTour, on_delete=models.SET_NULL, null=True)
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(blank=True)
    remark = models.TextField(blank=True, null=True)

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
        if not self.timestamp:
            self.timestamp = datetime.now()

    def __str__(self):
        return f"{self.type} for {self.building}"

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower("remark"),
                "building",
                "student_on_tour",
                "timestamp",
                name="unique_remark_for_building",
                violation_error_message=_(
                    "This remark was already uploaded to this building by this student on the tour."
                ),
            ),
        ]


class PictureOfRemark(models.Model):
    picture = models.ImageField(upload_to="building_pictures/")
    remark_at_building = models.ForeignKey(RemarkAtBuilding, on_delete=models.SET_NULL, null=True)
    hash = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"PictureOfRemark for {self.remark_at_building} (id:{self.remark_at_building.id}) (file: {self.picture}\thash: {self.hash})"

    class Meta:
        constraints = [
            UniqueConstraint(
                "hash",
                "remark_at_building",
                name="unique_picture_with_remark",
                violation_error_message=_("The building already has this upload."),
            ),
        ]


class Manual(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField(default=0)
    file = models.FileField(upload_to="building_manuals/")

    def __str__(self):
        return f"Manual: {str(self.file).split('/')[-1]} (version {self.version_number}) for {self.building}"

    def clean(self):
        super().clean()
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
                violation_error_message=_("The building already has a manual with the same version number"),
            ),
        ]


class EmailTemplate(models.Model):
    name = models.CharField(max_length=40)
    template = models.TextField()

    def __str__(self):
        return f"Email Template: {self.name}"

    class Meta:
        constraints = [
            UniqueConstraint(
                "name",
                name="unique_template_name",
                violation_error_message=_("The name for this template already exists."),
            ),
        ]
