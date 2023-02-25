from django.db import models

# Create your models here.
class Author(models.Model):
    name = models.CharField(max_length=199)
    email = models.EmailField()

    def __str__(self):
        return self.name

class Firefighter(models.Model):
    name = models.CharField(max_length=199)
    email = models.EmailField()

    def __str__(self):
        return self.name

class Police(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()

    def __str__(self):
        return self.name