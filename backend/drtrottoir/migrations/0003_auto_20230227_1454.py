# Generated by Django 4.1.7 on 2023-02-27 14:54

from django.db import migrations
from datetime import datetime

def generate_data(apps, schema_editor):
    Ronde = apps.get_model('drtrottoir', 'Ronde')
    Regio = apps.get_model('drtrottoir', 'Regio')
    User = apps.get_model('drtrottoir', 'User')
    Gebouw = apps.get_model('drtrottoir', 'Gebouw')
    ronde_namen = ['Coupure', 'Sterre', 'Noord', 'West', 'Winkelstraat']

    regios = Regio.objects.all()
    for regio, ronde_naam in zip(regios, ronde_namen):
        ronde = Ronde(naam=ronde_naam, regio=regio, modified_at=datetime.now())
        ronde.save()

    voornaam_user = ['Jan', 'Alfred', 'Leen', 'Geert', 'Maxim']
    achternaam_user = ['De Groote', 'Lievens', 'Verbeek', 'Daniels', 'Stevens']
    email = [f"{v}.{a}@gmail.com" for v, a in zip(voornaam_user, achternaam_user)]
    tel = [f"+327{i}21{i}689" for i in range(len(voornaam_user))]

    gebouw_stad = ['Gent', 'Antwerpen', 'Leuven', 'Brugge', 'Hasselt']
    gebouw_postcode= ['9000', '3000', '4000', '8000', '2000']
    gebouw_straat = ['Dorpstraat', 'Kerkstraat', 'Hoofdstraat', 'Grote markt', 'Slagstraat']
    gebouw_nummer = ['1', '57', '83', '105', '23']
    klantennummers = [f"7{i}43{i}645" for i in range(len(gebouw_nummer))]

    for i in range(len(voornaam_user)):
        user = User(email=email[i], voornaam=voornaam_user[i], achternaam=achternaam_user[i], telefoon=tel[i], rol='SY')
        user.save()
        gebouw = Gebouw(stad=gebouw_stad[i], postcode=gebouw_postcode[i],
                        straat=gebouw_straat[i], huisnummer=gebouw_nummer[i],
                        klantennummer=klantennummers[i], syndicus=user, regio=list(Regio.objects.all())[i])
        gebouw.save()



    Gebouw = apps.get_model('drtrottoir', 'Gebouw')
    Vuilophaling = apps.get_model('drtrottoir', 'Vuilophaling')
    GebouwOpRonde = apps.get_model('drtrottoir', 'GebouwOpRonde')
    StudentBijGebouwOpRonde = apps.get_model('drtrottoir', 'StudentBijGebouwOpRonde')
    FotoGebouw = apps.get_model('drtrottoir', 'FotoGebouw')
    Handleiding = apps.get_model('drtrottoir', 'Handleiding')


class Migration(migrations.Migration):

    dependencies = [
        ('drtrottoir', '0002_auto_20230227_1453'),
    ]

    operations = [
        migrations.RunPython(generate_data)
    ]