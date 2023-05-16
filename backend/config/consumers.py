import json

from channels.generic.websocket import AsyncWebsocketConsumer


class IndividualStudentOnTourConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.student_on_tour_id = None

    async def connect(self):
        self.student_on_tour_id = self.scope["url_route"]["kwargs"]["student_on_tour_id"]
        self.room_group_name = f"student_on_tour_{self.student_on_tour_id}"

        # join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # receive message from room group
    async def progress_update(self, event):
        current_building_index = event["current_building_index"]

        # send message to WebSocket
        await self.send(text_data=json.dumps({"current_building_index": current_building_index}))


class AllStudentOnTourConsumer(AsyncWebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.room_group_name = "student_on_tour_updates"

    async def connect(self):
        # join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

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


class RemarksAtBuildingConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.building_id = None

    async def connect(self):
        self.building_id = self.scope["url_route"]["kwargs"]["building_id"]
        self.room_group_name = f"remark-at-building_{self.building_id}"

        # join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # receive message from room group
    async def remark_at_building_remark_created(self, event):
        print("Remark at building remark created, called!")
        remark_at_building_remark = event["remark_at_building_remark"]
        # send message to WebSocket
        await self.send(text_data=json.dumps(remark_at_building_remark))
