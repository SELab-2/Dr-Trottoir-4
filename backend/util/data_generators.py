from base.models import User, Region, Building


def insert_dummy_region():
    r = Region(region="Gent")
    r.save()
    return r.id


def insert_dummy_syndic():
    s = User(
        first_name="test",
        last_name="test",
        phone_number="0487172529",
        role="SY"
    )
    s.save()
    return s.id


def createUser(is_staff: bool = True) -> User:
    user = User(
        first_name="test",
        last_name="test",
        email="test@test.com",
        is_staff=is_staff,
        is_active=True,
        phone_number="+32485710347",
        role="AD"
    )
    user.save()
    return user


def insert_dummy_tour():
    r_id = insert_dummy_region()
    t = Tour(
        name="Sterre",
        region=r_id,
        modified_at="2023-03-08T12:08:29+01:00"
    )
    t.save()
    return t.id

def insert_dummy_building():
    r_id = insert_dummy_region()
    s_id = insert_dummy_syndic()
    b = Building(
        city="Gent",
        postal_code=9000,
        street="Overpoort",
        house_number=10,
        client_number="1234567890abcdef",
        duration="1:00:00",
        region=r_id,
        syndic=s_id,
        name="CB"
    )
    b.save()
    return b.id