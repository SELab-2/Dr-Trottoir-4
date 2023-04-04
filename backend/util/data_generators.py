import io
import mimetypes
from datetime import date, datetime

from django.core.files.uploadedfile import InMemoryUploadedFile

from base.models import User, Region, Building, Tour, Role, BuildingOnTour, StudentOnTour, RemarkAtBuilding


def insert_dummy_region():
    o = Region.objects.filter(region="Gent")
    if len(o) == 1:
        return o[0].id
    r = Region(region="Gent")
    r.save()
    return r.id


def insert_dummy_role(role):
    o = Role.objects.filter(name=role)
    if len(o) == 1:
        return o[0].id
    r = Role(name=role, rank=1, description="testrole")
    r.save()
    return r.id


def insert_test_user(first_name: str = "test_student",
                     last_name: str = "test",
                     phone_number="+32467240957",
                     role: str = "admin",
                     ) -> int:
    o = User.objects.filter(first_name).first()
    if o:
        return o.id
    s = User(
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        role=Role.objects.get(id=insert_dummy_role(role))
    )
    s.save()
    return s.id


def insert_dummy_syndic():
    return insert_test_user(first_name="test_syn", role="syndic")


def insert_dummy_student():
    return insert_test_user(first_name="test_std", role="student")


roles = {}


def createUser(name: str = "admin", is_staff: bool = True, withRegion: bool = False) -> User:
    r = Role.objects.get(id=insert_dummy_role(name))
    user = User(
        first_name="test",
        last_name="test",
        email="test@test.com",
        is_staff=is_staff,
        is_active=True,
        phone_number="+32485710347",
        role=r,
    )
    user.save()
    if withRegion:
        r_id = insert_dummy_region()
        user.region.add(Region.objects.get(id=r_id))
    return user


def insert_dummy_tour():
    r_id = insert_dummy_region()
    t = Tour(
        name="Sterre",
        region=Region.objects.get(id=r_id),
        modified_at="2023-03-08T12:08:29+01:00"
    )
    t.save()
    return t.id


def insert_dummy_building(street="Overpoort"):
    r_id = insert_dummy_region()
    s_id = insert_dummy_syndic()
    b = Building(
        city="Gent",
        postal_code=9000,
        street=street,
        house_number=10,
        client_number="1234567890abcdef",
        duration="1:00:00",
        region=Region.objects.get(id=r_id),
        syndic=User.objects.get(id=s_id),
        name="CB"
    )
    b.save()
    return b.id


def insert_dummy_building_on_tour():
    t_id = insert_dummy_tour()
    b_id = insert_dummy_building()
    BoT = BuildingOnTour(
        tour=Tour.objects.get(id=t_id),
        building=Building.objects.get(id=b_id),
        index=0
    )
    BoT.save()
    return BoT.id


def insert_dummy_student_on_tour():
    SoT = StudentOnTour(
        tour_id=insert_dummy_tour(),
        date=date.today(),
        student_id=insert_dummy_student()
    )
    SoT.save()
    return SoT.id


def insert_dummy_remark_at_building():
    RaB = RemarkAtBuilding(
        student_on_tour_id=insert_dummy_student_on_tour(),
        building_id=insert_dummy_building(),
        remark="illegal dumping",
        timestamp=str(datetime.now()),
    )
    RaB.save()
    return RaB.id


def createMemoryFile(filename: str):
    filename = filename.strip()
    with open(filename, "rb") as file:
        file_object = io.BytesIO(file.read())
        file_object.seek(0)
        file_object.read()
        size = file_object.tell()
        file_object.seek(0)

        content_type, charset = mimetypes.guess_type(filename)

        return InMemoryUploadedFile(file=file_object, name=filename, field_name=None, content_type=content_type,
                                    charset=charset, size=size)
