# Generated by Django 4.2.1 on 2023-05-18 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_remove_remarkatbuilding_unique_remark_for_building_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='building',
            name='bus',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        migrations.AlterField(
            model_name='buildingcomment',
            name='date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
