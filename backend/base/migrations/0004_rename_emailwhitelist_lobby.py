# Generated by Django 4.1.7 on 2023-03-22 11:41

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("base", "0003_remove_manual_unique_manual_and_more"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="EmailWhitelist",
            new_name="Lobby",
        ),
    ]
