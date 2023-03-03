from django.db import migrations

def generate_data(apps, schema_editor):
    User = apps.get_model('base', 'User')
    Regio = apps.get_model('base', 'Regio')

    regios = ['Gent', 'Antwerpen', 'Brugge', 'Hasselt', 'Leuven']

    voornaam_user = ['Bert', 'Rosalie', 'Maaike', 'Axel', 'Tim', 'Jolien', 'Sara', 'Wannes']
    achternaam_user = ['Janssens', 'Visser', 'Dijkstra', 'Jacobs', 'Smits', 'Perters', 'Willems', 'Geraerts']
    email = [f"{v}.{a}@gmail.com" for v, a in zip(voornaam_user, achternaam_user)]
    tel = [f"+324{i}51{i}643" for i in range(8)]

    res = []

    for r in regios:
        regio = Regio(regio=r)
        res.append(regio)
        regio.save()

    for i in range(len(voornaam_user)):
        user = User(email=email[i], voornaam=voornaam_user[i], achternaam=achternaam_user[i], telefoon=tel[i], rol='ST')
        user.save()
        user.regio.add(res[i % 5])


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(generate_data)
    ]
