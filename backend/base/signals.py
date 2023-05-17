from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Max
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from base.models import StudentOnTour, RemarkAtBuilding
from base.serializers import RemarkAtBuildingSerializer


@receiver(post_save, sender=RemarkAtBuilding)
def process_remark_at_building(sender, instance: RemarkAtBuilding, **kwargs):

    # Broadcast all remarks to the building websocket
    remark_at_building_remark = RemarkAtBuildingSerializer(instance).data
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"remark-at-building_{instance.building.id}",
        {
            "type": "remark.at.building.remark.created",
            "remark_at_building_remark": remark_at_building_remark,
        },
    )

    student_on_tour = instance.student_on_tour

    if instance.type == RemarkAtBuilding.OPMERKING:
        # Broadcast only the "OPMERKINGEN" on the student_on_tour websocket
        async_to_sync(channel_layer.group_send)(
            f"student_on_tour_{student_on_tour.id}_remarks",
            {
                "type": "remark.at.building.remark.created",
                "remark_at_building_remark": remark_at_building_remark,
            },
        )
    elif instance.type == RemarkAtBuilding.AANKOMST:
        # since we start indexing our BuildingOnTour with index 1, this works (since current_building_index starts at 0)
        student_on_tour.current_building_index += 1

        # since we only start calculating worked time from the moment we arrive at the first building
        # we recalculate the start time of the tour
        if student_on_tour.current_building_index == 1:
            student_on_tour.started_tour = timezone.now()

        student_on_tour.save()

        # Broadcast update to websocket
        async_to_sync(channel_layer.group_send)(
            f"student_on_tour_{student_on_tour.id}_progress",
            {
                "type": "progress.update",
                "current_building_index": student_on_tour.current_building_index,
            },
        )
    elif (
        instance.type == RemarkAtBuilding.VERTREK
        and student_on_tour.current_building_index == student_on_tour.max_building_index
    ):
        student_on_tour.completed_tour = timezone.now()
        student_on_tour.save()

        # Broadcast update to websocket
        async_to_sync(channel_layer.group_send)(
            "student_on_tour_updates", {"type": "student.on.tour.completed", "student_on_tour_id": student_on_tour.id}
        )


@receiver(pre_save, sender=StudentOnTour)
def set_max_building_index(sender, instance: StudentOnTour, **kwargs):
    if not instance.max_building_index and instance.started_tour:
        max_index = instance.tour.buildingontour_set.aggregate(Max("index"))["index__max"]
        instance.max_building_index = max_index
