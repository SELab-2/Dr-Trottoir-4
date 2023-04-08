from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Max
from django.db.models.signals import post_save
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
            'student_on_tour_%s' % student_on_tour.id,
            {
                'type': 'progress_update',
                'current_building_index': student_on_tour.current_building_index,
            }
        )


@receiver(post_save, sender=StudentOnTour)
def set_max_building_index(sender, instance: StudentOnTour, created, **kwargs):
    if created or instance.started_tour:
        max_index = instance.tour.buildingontour_set.aggregate(Max('index'))['index__max']
        instance.max_building_index = max_index
        instance.save()


@receiver(post_save, sender=StudentOnTour)
def student_on_tour_update(sender, instance: StudentOnTour, **kwargs):
    if 'update_fields' in kwargs and 'current_building_index' not in kwargs['update_fields']:
        # The update didn't modify the current_building_index field, so no need to send a message
        return

    message = {
        'type': 'student_on_tour_update',
        'data': {
            'id': instance.id,
            'current_building_index': instance.current_building_index,
        }
    }

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "student_on_tour_updates",
        {
            "type": "student_on_tour_update",
            "student_on_tour_id": instance.id,
            "current_building_index": instance.current_building_index,
            "max_building_index": instance.max_building_index
        }
    )
