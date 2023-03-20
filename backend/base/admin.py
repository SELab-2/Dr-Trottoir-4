from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(Region)
admin.site.register(Building)
admin.site.register(GarbageCollection)
admin.site.register(Tour)
admin.site.register(BuildingOnTour)
admin.site.register(StudentAtBuildingOnTour)
admin.site.register(PictureBuilding)
admin.site.register(Manual)
admin.site.register(BuildingComment)
admin.site.register(Role)
admin.site.register(EmailWhitelist)
admin.site.register(EmailTemplate)
