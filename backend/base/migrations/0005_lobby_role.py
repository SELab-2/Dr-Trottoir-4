# Generated by Django 4.1.7 on 2023-03-22 18:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0004_rename_emailwhitelist_lobby'),
    ]

    operations = [
        migrations.AddField(
            model_name='lobby',
            name='role',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.role'),
        ),
    ]
