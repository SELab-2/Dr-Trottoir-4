# Generated by Django 4.1.7 on 2023-04-06 13:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("base", "0001_initial"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="buildingontour",
            constraint=models.UniqueConstraint(
                models.F("index"),
                models.F("tour"),
                name="unique_index_on_tour",
                violation_error_message="This index is already in use.",
            ),
        ),
    ]