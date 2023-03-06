# Generated by Django 4.1.7 on 2023-03-06 09:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('firstname', models.CharField(max_length=40)),
                ('lastname', models.CharField(max_length=40)),
                ('phone_number', phonenumber_field.modelfields.PhoneNumberField(max_length=128, region='BE')),
                ('role', models.CharField(choices=[('ST', 'Student'), ('SS', 'Superstudent'), ('AD', 'Admin'), ('SY', 'Syndic')], max_length=2)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Building',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city', models.CharField(max_length=40)),
                ('postal_code', models.CharField(max_length=10)),
                ('street', models.CharField(max_length=60)),
                ('house_number', models.CharField(max_length=10)),
                ('client_number', models.CharField(blank=True, max_length=40, null=True)),
                ('duration', models.TimeField(default='00:00')),
            ],
        ),
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('region', models.CharField(max_length=40, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Tour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=40)),
                ('modified_at', models.DateTimeField()),
                ('region', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.region')),
            ],
        ),
        migrations.CreateModel(
            name='StudentAtBuildingOnTour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('building', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.building')),
                ('student', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.tour')),
            ],
        ),
        migrations.CreateModel(
            name='PictureBuilding',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('picture_name', models.CharField(max_length=2048)),
                ('description', models.TextField(blank=True, null=True)),
                ('timestamp', models.DateTimeField()),
                ('type', models.CharField(choices=[('AA', 'Aankomst'), ('BI', 'Binnen'), ('VE', 'Vertrek'), ('OP', 'Opmerking')], max_length=2)),
                ('building', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.building')),
            ],
        ),
        migrations.AddField(
            model_name='building',
            name='region',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.region'),
        ),
        migrations.AddField(
            model_name='building',
            name='syndic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='user',
            name='region',
            field=models.ManyToManyField(to='base.region'),
        ),
        migrations.AddField(
            model_name='user',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions'),
        ),
        migrations.CreateModel(
            name='Manual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version_number', models.IntegerField()),
                ('filename', models.CharField(max_length=2048)),
                ('building', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.building')),
            ],
            options={
                'unique_together': {('building_id', 'version_number')},
            },
        ),
        migrations.CreateModel(
            name='GarbageCollection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('garbage_type', models.CharField(choices=[('GFT', 'GFT'), ('GLS', 'Glas'), ('GRF', 'Grof vuil'), ('KER', 'Kerstbomen'), ('PAP', 'Papier'), ('PMD', 'PMD'), ('RES', 'Restafval')], max_length=3)),
                ('building', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.building')),
            ],
            options={
                'unique_together': {('building_id', 'garbage_type', 'date')},
            },
        ),
        migrations.CreateModel(
            name='BuildingURL',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.CharField(max_length=2048)),
                ('firstname_resident', models.CharField(max_length=40)),
                ('lastname_resident', models.CharField(max_length=40)),
                ('building', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.building')),
            ],
            options={
                'unique_together': {('url', 'building_id')},
            },
        ),
        migrations.CreateModel(
            name='BuildingOnTour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index', models.IntegerField()),
                ('building', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.building')),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.tour')),
            ],
            options={
                'unique_together': {('index', 'tour')},
            },
        ),
        migrations.AlterUniqueTogether(
            name='building',
            unique_together={('city', 'postal_code', 'street', 'house_number')},
        ),
    ]
