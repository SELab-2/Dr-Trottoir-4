from channels.generic.websocket import AsyncWebsocketConsumer
import json


class StudentOnTourConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.student_on_tour_id = None

    async def connect(self):
        self.student_on_tour_id = self.scope['url_route']['kwargs']['student_on_tour_id']
        self.room_group_name = 'student_on_tour_%s' % self.student_on_tour_id

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def progress_update(self, event):
        current_building_index = event['current_building_index']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'current_building_index': current_building_index
        }))
