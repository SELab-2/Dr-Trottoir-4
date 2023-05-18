from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Max
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

from base.models import StudentOnTour, RemarkAtBuilding, GarbageCollection
from base.serializers import RemarkAtBuildingSerializer, StudOnTourSerializer, GarbageCollectionSerializer


@receiver(post_save, sender=RemarkAtBuilding)
def process_remark_at_building(sender, instance: RemarkAtBuilding, **kwargs):
    if instance.type == RemarkAtBuilding.OPMERKING:
        # Broadcast to remark at building websocket
        remark_at_building_remark = RemarkAtBuildingSerializer(instance).data
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"remark-at-building_{instance.building.id}",
            {
                "type": "remark.at.building.remark.created",
                "remark_at_building_remark": remark_at_building_remark,
            },
        )
        async_to_sync(channel_layer.group_send)(
            f"student_on_tour_{instance.student_on_tour.id}_remarks",
            {
                "type": "remark.at.building.remark.created",
                "remark_at_building_remark": remark_at_building_remark,
            },
        )
        return

    student_on_tour = instance.student_on_tour

    if instance.type == RemarkAtBuilding.AANKOMST:
        # since we start indexing our BuildingOnTour with index 1, this works (since current_building_index starts at 0)
        update_fields = ["current_building_index"]
        student_on_tour.current_building_index += 1

        # since we only start calculating worked time from the moment we arrive at the first building
        # we recalculate the start time of the tour
        if student_on_tour.current_building_index == 1:
            student_on_tour.started_tour = timezone.now()
            update_fields.append("started_tour")

        student_on_tour.save(update_fields=update_fields)

        # Broadcast update to websocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"student_on_tour_{student_on_tour.id}_progress",
            {
                "type": "progress.update",
                "current_building_index": student_on_tour.current_building_index,
            },
        )
        return
    if (
            instance.type == RemarkAtBuilding.VERTREK
            and student_on_tour.current_building_index == student_on_tour.max_building_index
    ):
        student_on_tour.completed_tour = timezone.now()
        student_on_tour.save(update_fields=["completed_tour"])

        # Broadcast update to websocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "student_on_tour_updates_progress",
            {"type": "student.on.tour.completed", "student_on_tour_id": student_on_tour.id},
        )


@receiver(pre_save, sender=StudentOnTour)
def set_max_building_index_or_notify(sender, instance: StudentOnTour, **kwargs):
    if not instance.max_building_index:
        max_index = instance.tour.buildingontour_set.aggregate(Max("index"))["index__max"]
        instance.max_building_index = max_index


@receiver(post_save, sender=StudentOnTour)
def notify_student_on_tour_subscribers(sender, instance: StudentOnTour, **kwargs):
    if not instance.started_tour:
        student_on_tour = StudOnTourSerializer(instance).data
        channel = get_channel_layer()
        async_to_sync(channel.group_send)(
            "student_on_tour_updates",
            {
                "type": "student.on.tour.created.or.adapted",
                "student_on_tour": student_on_tour,
            },
        )


@receiver(post_delete, sender=StudentOnTour)
def notify_student_on_tour_subscribers(sender, instance: StudentOnTour, **kwargs):
    student_on_tour = StudOnTourSerializer(instance).data
    channel = get_channel_layer()
    async_to_sync(channel.group_send)(
        "student_on_tour_updates",
        {
            "type": "student.on.tour.deleted",
            "student_on_tour": student_on_tour,
        },
    )


@receiver(post_save, sender=GarbageCollection)
def notify_garbage_collection_subscribers(sender, instance: GarbageCollection, **kwargs):
    garbage_collection = GarbageCollectionSerializer(instance).data
    channel = get_channel_layer()
    async_to_sync(channel.group_send)(
        "garbage_collection_updates",
        {
            "type": "garbage.collection.created.or.adapted",
            "garbage_collection": garbage_collection,
        },
    )


@receiver(post_delete, sender=GarbageCollection)
def notify_garbage_collection_subscribers(sender, instance: GarbageCollection, **kwargs):
    garbage_collection = GarbageCollectionSerializer(instance).data
    channel = get_channel_layer()
    async_to_sync(channel.group_send)(
        "garbage_collection_updates",
        {
            "type": "garbage.collection.deleted",
            "garbage_collection": garbage_collection,
        },
    )
