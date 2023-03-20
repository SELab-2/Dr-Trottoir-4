# Generated by Django 4.1.7 on 2023-03-20 20:33

from django.db import migrations, models
import django.db.models.functions.text


class Migration(migrations.Migration):
    dependencies = [
        ("base", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmailTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=40)),
                ("template", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="EmailWhitelist",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "email",
                    models.EmailField(
                        error_messages={"unique": "This email is already on the whitelist."},
                        max_length=254,
                        unique=True,
                        verbose_name="email address",
                    ),
                ),
                (
                    "verification_code",
                    models.CharField(
                        error_messages={"unique": "This verification code already exists."}, max_length=128, unique=True
                    ),
                ),
            ],
        ),
        migrations.RemoveField(
            model_name="buildingurl",
            name="building",
        ),
        migrations.RemoveConstraint(
            model_name="building",
            name="address_unique",
        ),
        migrations.AddField(
            model_name="building",
            name="bus",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="building",
            name="public_id",
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
        migrations.AlterField(
            model_name="building",
            name="house_number",
            field=models.PositiveIntegerField(),
        ),
        migrations.AddConstraint(
            model_name="building",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("city"),
                django.db.models.functions.text.Lower("street"),
                django.db.models.functions.text.Lower("postal_code"),
                models.F("house_number"),
                django.db.models.functions.text.Lower("bus"),
                name="address_unique",
                violation_error_message="A building with this address already exists.",
            ),
        ),
        migrations.DeleteModel(
            name="BuildingURL",
        ),
        migrations.AddConstraint(
            model_name="emailtemplate",
            constraint=models.UniqueConstraint(
                models.F("name"),
                name="unique_template_name",
                violation_error_message="The name for this template already exists.",
            ),
        ),
    ]
