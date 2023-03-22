import io
import mimetypes

from django.core.files.uploadedfile import InMemoryUploadedFile

from base.models import User, Region, Building, Tour, Role, BuildingOnTour


def insert_dummy_region():
    o = Region.objects.filter(region="Gent")
    if len(o) == 1:
        return o[0].id
    r = Region(region="Gent")
    r.save()
    return r.id


def insert_dummy_syndic():
    o = User.objects.filter(first_name="test_syn")
    if len(o) == 1:
        return o[0].id
    s = User(
        first_name="test_syn",
        last_name="test",
        phone_number="0487172529",
        role=Role.objects.get(id=insert_dummy_role("syndic"))
    )
    s.save()
    return s.id


roles = {}


def insert_dummy_role(role):
    o = Role.objects.filter(name=role)
    if len(o) == 1:
        return o[0].id
    r = Role(name=role, rank=5, description="testrole")
    r.save()
    return r.id


def createUser(is_staff: bool = True, withRegion: bool = False) -> User:
    r = Role.objects.get(id=insert_dummy_role("AD"))
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
