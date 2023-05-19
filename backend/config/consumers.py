import json

from channels.generic.websocket import AsyncWebsocketConsumer


class GeneralAsyncConsumer(AsyncWebsocketConsumer):
    room_group_name = None

    async def connect(self):
        # join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


class StudentOnTourProgressIndividual(GeneralAsyncConsumer):
    async def connect(self):
        student_on_tour_id = self.scope["url_route"]["kwargs"]["student_on_tour_id"]
        self.room_group_name = f"student_on_tour_{student_on_tour_id}_progress"
        await super().connect()

    async def progress_update(self, event):
        current_building_index = event["current_building_index"]

        # send message to WebSocket
        await self.send(text_data=json.dumps({"current_building_index": current_building_index}))


class StudentOnTourProgressAll(GeneralAsyncConsumer):
    room_group_name = "student_on_tour_updates_progress"

    # receive message from room group
    async def student_on_tour_started(self, event):
        student_on_tour_id = event["student_on_tour_id"]

        # send message to WebSocket
        await self.send(text_data=json.dumps({"state": "started", "student_on_tour_id": student_on_tour_id}))

    # receive message from room group
    async def student_on_tour_completed(self, event):
        student_on_tour_id = event["student_on_tour_id"]

        # send message to WebSocket
        await self.send(text_data=json.dumps({"state": "completed", "student_on_tour_id": student_on_tour_id}))


class RemarkAtBuildingBuildingRemarks(GeneralAsyncConsumer):
    async def connect(self):
        building_id = self.scope["url_route"]["kwargs"]["building_id"]
        self.room_group_name = f"remark-at-building_{building_id}"
        # join room group
        await super().connect()

    async def remark_at_building_remark_created(self, event):
        remark_at_building_remark = event["remark_at_building_remark"]
        # send message to WebSocket
        await self.send(text_data=json.dumps(remark_at_building_remark))


class StudentOnTourRemarks(GeneralAsyncConsumer):
    async def connect(self):
        student_on_tour_id = self.scope["url_route"]["kwargs"]["student_on_tour_id"]
        self.room_group_name = f"student_on_tour_{student_on_tour_id}_remarks"
        # join room group
        await super().connect()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # receive message from room group
    async def remark_at_building_remark_created(self, event):
        remark_at_building_remark = event["remark_at_building_remark"]
        # send message to WebSocket
        await self.send(text_data=json.dumps(remark_at_building_remark))


class StudentOnTourAll(GeneralAsyncConsumer):
    room_group_name = "student_on_tour_updates"

    # receive message from room group
    async def student_on_tour_created_or_adapted(self, event):
        student_on_tour = event["student_on_tour"]
        # send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "created_or_adapted",
                    "student_on_tour": student_on_tour,
                }
            )
        )

    async def student_on_tour_deleted(self, event):
        student_on_tour = event["student_on_tour"]
        # send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "deleted",
                    "student_on_tour": student_on_tour,
                }
            )
        )


class GarbageCollectionAll(GeneralAsyncConsumer):
    room_group_name = "garbage_collection_updates"

    # receive message from room group
    async def garbage_collection_created_or_adapted(self, event):
        garbage_collection = event["garbage_collection"]
        # send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "created_or_adapted",
                    "garbage_collection": garbage_collection,
                }
            )
        )

    async def garbage_collection_deleted(self, event):
        garbage_collection = event["garbage_collection"]
        # send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "deleted",
                    "garbage_collection": garbage_collection,
                }
            )
        )
