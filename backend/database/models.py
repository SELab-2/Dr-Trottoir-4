from django.db import models


class Regio(models.Model):
    regio = models.CharField(max_length=40, unique=True)

class User(models.Model):
    email = models.CharField(max_length=254, unique=True)
    voornaam = models.CharField(max_length=40)
    achternaam = models.CharField(max_length=40)
    telefoon = models.CharField(max_length=20)
    regio = models.ManyToManyField(Regio)

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


class Gebouw(models.Model):
    stad = models.CharField(max_length=40)
    postcode = models.CharField(max_length=10)
    straat = models.CharField(max_length=60)
    huisnummer = models.CharField(max_length=10)
    klantennummer = models.CharField(max_length=40, blank=True, null=True)
    syndicus_id = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    regio_id = models.ForeignKey(Regio, on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        unique_together = ('stad', 'postcode', 'straat', 'huisnummer')


class GebouwURL(models.Model):
    url = models.CharField(max_length=2048)
    voornaam_inwoner = models.CharField(max_length=40)
    achternaam_inwoner = models.CharField(max_length=40)
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
    regio_id = models.ForeignKey(Regio, on_delete=models.SET_NULL, blank=True, null=True)
    modified_at = models.DateTimeField()


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
    student = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)


class FotoGebouw(models.Model):
    gebouw_id = models.ForeignKey(Gebouw, on_delete=models.CASCADE)
    foto_naam = models.CharField(max_length=2048)
    beschrijving = models.TextField(blank=True, null=True)
    tijdstip = models.DateTimeField()

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
    bestandsnaam = models.CharField(max_length=2048)

    class Meta:
        unique_together = ('gebouw_id', 'versienummer')
