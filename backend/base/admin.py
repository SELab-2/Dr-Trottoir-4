from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(Region)
admin.site.register(Building)
admin.site.register(BuildingURL)
admin.site.register(GarbageCollection)
admin.site.register(Tour)
admin.site.register(BuildingOnTour)
admin.site.register(StudentAtBuildingOnTour)
admin.site.register(PictureBuilding)
admin.site.register(Manual)
admin.site.register(BuildingComment)
