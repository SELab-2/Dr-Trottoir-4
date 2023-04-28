import json

from channels.generic.websocket import AsyncWebsocketConsumer


class IndividualStudentOnTourConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.student_on_tour_id = None

    async def connect(self):
        self.student_on_tour_id = self.scope['url_route']['kwargs']['student_on_tour_id']
        self.room_group_name = f'student_on_tour_{self.student_on_tour_id}'

        # join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # receive message from room group
    async def progress_update(self, event):
        current_building_index = event['current_building_index']

        # send message to WebSocket
        await self.send(text_data=json.dumps({
            'current_building_index': current_building_index
        }))


class AllStudentOnTourConsumer(AsyncWebsocketConsumer):

    def __init__(self):
        super().__init__()
        self.room_name = "student_on_tour_updates"

    async def connect(self):
        # join room group
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    # receive message from room group
    async def student_on_tour_started(self, event):
        student_on_tour = event["student_on_tour"]

        # send message to WebSocket
        await self.send(text_data=json.dumps(student_on_tour))

        # receive message from room group
    async def student_on_tour_completed(self, event):
        student_on_tour = event["student_on_tour"]

        # send message to WebSocket
        await self.send(text_data=json.dumps(student_on_tour))