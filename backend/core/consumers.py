import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PublicEventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "public_events"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_event(self, event):
        message = event['message']
        await self.send(text_data=message)
