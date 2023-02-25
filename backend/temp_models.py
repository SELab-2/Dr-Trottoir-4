from django.db import models


class Regio(models.Model):
    regio = models.CharField(max_length=40, unique=True)


class User(models.Model):
    email = models.CharField(max_length=254, unique=True)
    voornaam = models.CharField(max_length=40)
    achternaam = models.CharField(max_length=40)
    telefoon = models.CharField(max_length=20)
    regios = models.ManyToManyField(Regio, on_delete=models.SET_NULL)

    STUDENT = 'ST'
    SUPERSTUDENT = 'SS'
    ADMIN = 'AD'
    SYNDICUS = 'SY'
    ROLLEN = [
        (STUDENT, 'Student'),
        (SUPERSTUDENT, 'Superstudent'),
        (ADMIN, 'Admin'),
        (SYNDICUS, 'Syndicus')
    ]
    rol = models.CharField(
        max_length=2,
        choices=ROLLEN)


# class UserRegion(models.Model):
#     users = models.ManyToManyField(User, on_delete=models.CASCADE)
#     regio = models.ManyToManyField(Regio, on_delete=models.SET_NULL)


class Gebouw(models.Model):
    stad = models.CharField(max_length=40)
    postcode = models.CharField(max_length=10)
    straat = models.CharField(max_length=60)
    huisnummer = models.CharField(max_length=10)
    klantennummer = models.CharField(max_length=40, blank=True, null=True)
    syndicus = models.ManyToManyField(User, on_delete=models.SET_NULL, blank=True, null=True)
    regio = models.ForeignKey(Regio, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ('stad', 'postcode', 'straat', 'huisnummer')


class GebouwURL(models.Model):
    url = models.CharField(max_length=200)
    voornaam = models.CharField(max_length=40)
    achternaam = models.CharField(max_length=40)
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('url', 'gebouw_id')


class Vuilophaling(models.Model):
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)
    datum = models.DateField()

    GFT = 'GFT'
    GLAS = 'GLS'
    GROF_VUIL = 'GRF'
    KERSTBOMEN = 'KER'
    PAPIER = 'PAP'
    PMD = 'PMD'
    RESTAFVAL = 'RES'
    VUIL = [
        (GFT, 'GFT'),
        (GLAS, 'Glas'),
        (GROF_VUIL, 'Grof vuil'),
        (KERSTBOMEN, 'Kerstbomen'),
        (PAPIER, 'Papier'),
        (PMD, 'PMD'),
        (RESTAFVAL, 'Restafval')
    ]
    soort_vuil = models.CharField(
        max_length=3,
        choices=VUIL)

    class Meta:
        unique_together = ('gebouw_id', 'soort_vuil', 'datum')


class Ronde(models.Model):
    naam = models.CharField(max_length=40)
    regio = models.ForeignKey(Regio, on_delete=models.CASCADE)
    modified_at = models.TimeField


class GebouwOpRonde(models.Model):
    ronde = models.ForeignKey(Ronde, on_delete=models.CASCADE)
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)
    index = models.IntegerField()

    class Meta:
        unique_together = ('index', 'ronde')


class StudentBijGebouwOpRonde(models.Model):
    ronde = models.ForeignKey(Ronde, on_delete=models.CASCADE)
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)
    datum = models.DateField()
    student = models.ForeignKey(User, on_delete=models.SET_NULL)


class FotoGebouw(models.Model):
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)
    foto_naam = models.CharField()
    beschrijving = models.TextField(blank=True, null=True)
    tijdstip = models.TimeField()

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


class Handleiding(models.Model):
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)
    versienummer = models.IntegerField()
    bestandsnaam = models.CharField()

    class Meta:
        unique_together = ('gebouw_id', 'versienummer')
