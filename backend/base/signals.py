from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Max
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from base.models import StudentOnTour, RemarkAtBuilding


@receiver(post_save, sender=RemarkAtBuilding)
def progress_current_building_index(sender, instance: RemarkAtBuilding, **kwargs):
    if instance.type == RemarkAtBuilding.AANKOMST:
        student_on_tour = instance.student_on_tour
        # since we start indexing our BuildingOnTour with index 1, this works (since current_building_index starts at 0)
        student_on_tour.current_building_index += 1
        student_on_tour.save()

        # Broadcast update to websocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"student_on_tour_{student_on_tour.id}",
            {
                "type": "progress.update",
                "current_building_index": student_on_tour.current_building_index,
            },
        )


@receiver(pre_save, sender=StudentOnTour)
def set_max_building_index(sender, instance: StudentOnTour, **kwargs):
    if not instance.max_building_index and instance.started_tour:
        max_index = instance.tour.buildingontour_set.aggregate(Max("index"))["index__max"]
        instance.max_building_index = max_index
