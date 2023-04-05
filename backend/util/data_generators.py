import io
import mimetypes
from datetime import date, timedelta

from django.core.files.uploadedfile import InMemoryUploadedFile

from base.models import User, Region, Building, Tour, Role, BuildingOnTour, BuildingComment, EmailTemplate, \
    GarbageCollection, Lobby, Manual


def insert_dummy_region(name="Gent"):
    o = Region.objects.filter(region=name)
    if len(o) == 1:
        return o[0].id
    r = Region(region=name)
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


def insert_dummy_role(role):
    o = Role.objects.filter(name=role.lower())
    if len(o) == 1:
        return o[0].id
    r = Role(name=role.lower(), rank=1, description="testrole")
    r.save()
    return r.id


email_counter = 0


def createUser(name: str = "admin", is_staff: bool = True, withRegion: bool = False) -> User:
    global email_counter
    r = Role.objects.get(id=insert_dummy_role(name))
    user = User(
        first_name="test",
        last_name="test",
        email=f"test_{email_counter}@test.com",
        is_staff=is_staff,
        is_active=True,
        phone_number="+32485710347",
        role=r,
    )
    email_counter += 1
    user.save()
    if withRegion:
        r_id = insert_dummy_region()
        user.region.add(Region.objects.get(id=r_id))
    return user


index = 0


def insert_dummy_tour():
    global index
    r_id = insert_dummy_region()
    t = Tour(
        name=f"Sterre S{index}",
        region=Region.objects.get(id=r_id),
        modified_at="2023-03-08T12:08:29+01:00"
    )
    index += 1
    t.save()
    return t.id


number = 1


def insert_dummy_building(street="Overpoort"):
    global number
    r_id = insert_dummy_region()
    s_id = insert_dummy_syndic()
    b = Building(
        city="Gent",
        postal_code=9000,
        street=street,
        house_number=number,
        client_number="1234567890abcdef",
        duration="1:00:00",
        region=Region.objects.get(id=r_id),
        syndic=User.objects.get(id=s_id),
        name="CB"
    )
    number += 1
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


def insert_dummy_building_comment():
    b_id = insert_dummy_building()
    BC = BuildingComment(
        comment="<3 python",
        date="2023-03-08T12:08:29+01:00",
        building=Building.objects.get(id=b_id)
    )
    BC.save()
    return BC.id


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


title = "a"


def insert_dummy_email_template():
    global title
    ET = EmailTemplate(
        name="testTemplate " + title,
        template="<p>{{name}<p>"
    )
    title += "a"
    ET.save()
    return ET.id


d = date.today()


def insert_dummy_garbage():
    global d
    b_id = insert_dummy_building()
    garbage = GarbageCollection(building=Building.objects.get(id=b_id), date=d, garbage_type="RES")
    d += timedelta(days=1)
    garbage.save()
    return garbage.id


def insert_dummy_lobby():
    global email_counter
    r_id = insert_dummy_role("Student")
    lobby = Lobby(
        email=f"test_lobby_{email_counter}@example.com",
        role=Role.objects.get(id=r_id),
        verification_code="azerty>qwerty"
    )
    email_counter += 1
    lobby.save()
    return lobby.id


f = createMemoryFile("backend/manual/lorem-ipsum.pdf")


version = 0
def insert_dummy_manual():
    global version
    b_id = insert_dummy_building()
    m = Manual(
        building=Building.objects.get(id=b_id),
        file=f,
        version_number=version
    )
    version+=1
    m.save()
    return m.id
