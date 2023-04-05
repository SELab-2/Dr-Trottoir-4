# Generated by Django 4.1.7 on 2023-04-01 09:41

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.db.models.functions.text


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PictureOfRemark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('picture', models.ImageField(upload_to='building_pictures/')),
            ],
        ),
        migrations.CreateModel(
            name='RemarkAtBuilding',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(blank=True)),
                ('remark', models.TextField(blank=True, null=True)),
                ('type', models.CharField(choices=[('AA', 'Aankomst'), ('BI', 'Binnen'), ('VE', 'Vertrek'), ('OP', 'Opmerking')], max_length=2)),
                ('building_on_tour', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.buildingontour')),
            ],
        ),
        migrations.CreateModel(
            name='StudentOnTour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('student', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('tour', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.tour')),
            ],
        ),
        migrations.RemoveField(
            model_name='studentatbuildingontour',
            name='building_on_tour',
        ),
        migrations.RemoveField(
            model_name='studentatbuildingontour',
            name='student',
        ),
        migrations.DeleteModel(
            name='PictureBuilding',
        ),
        migrations.DeleteModel(
            name='StudentAtBuildingOnTour',
        ),
        migrations.AddField(
            model_name='pictureofremark',
            name='remark_at_building',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.remarkatbuilding'),
        ),
        migrations.AddConstraint(
            model_name='studentontour',
            constraint=models.UniqueConstraint(models.F('tour'), models.F('date'), models.F('student'), name='unique_student_on_tour', violation_error_message='The student is already assigned to this tour on this date.'),
        ),
        migrations.AddConstraint(
            model_name='remarkatbuilding',
            constraint=models.UniqueConstraint(django.db.models.functions.text.Lower('remark'), models.F('building_on_tour'), name='unique_remark_for_building', violation_error_message='This remark was already uploaded to this building.'),
        ),
        migrations.AddConstraint(
            model_name='pictureofremark',
            constraint=models.UniqueConstraint(django.db.models.functions.text.Lower('picture'), models.F('remark_at_building'), name='unique_picture_with_remark', violation_error_message='The building already has this upload.'),
        ),
    ]