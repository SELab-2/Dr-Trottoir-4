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
            f'student_on_tour_{student_on_tour.id}',
            {
                'type': 'progress_update',
                'current_building_index': student_on_tour.current_building_index,
            }
        )


@receiver(post_save, sender=StudentOnTour)
def student_on_tour_update(sender, instance, update_fields, **kwargs):
    # we only want to start the tour if the max building index has been set.
    if not instance.max_building_index:
        return

    if 'started_tour' in update_fields:
        event_type = 'student_on_tour_started'
    elif 'completed_tour' in update_fields:
        event_type = 'student_on_tour_completed_tour'
    else:
        return

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'student_on_tour_updates',
        {
            'type': event_type,
            'student_on_tour': instance,
        }
    )


@receiver(post_save, sender=StudentOnTour)
def set_max_building_index(sender, instance: StudentOnTour, created, **kwargs):
    if not instance.max_building_index and instance.started_tour:
        max_index = instance.tour.buildingontour_set.aggregate(Max('index'))['index__max']
        instance.max_building_index = max_index
        instance.save()
