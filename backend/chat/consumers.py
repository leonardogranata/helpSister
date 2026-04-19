import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

from .models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        self.user = self.scope.get('user')
        if not self.user or self.user.is_anonymous:
            await self.close()
            return
        self.room_group_name = f'chat_{self.conversation_id}'
        is_participant = await database_sync_to_async(self._is_participant)()
        if not is_participant:
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    def _is_participant(self):
        try:
            conv = Conversation.objects.get(pk=self.conversation_id)
            return conv.participants.filter(pk=self.user.pk).exists()
        except Conversation.DoesNotExist:
            return False

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, data):
        content = data.get('message')
        if not content:
            return
        msg = await database_sync_to_async(self._create_message)(content)
        serialized = MessageSerializer(msg).data
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chat.message',
            'message': serialized,
        })
        participants = await database_sync_to_async(self._get_other_participants)()
        for pid in participants:
            await self.channel_layer.group_send(f'user_{pid}', {
                'type': 'notify.message',
                'conversation_id': self.conversation_id,
                'message': serialized,
            })

    def _create_message(self, content):
        conv = Conversation.objects.get(pk=self.conversation_id)
        msg = Message.objects.create(conversation=conv, sender=self.user, content=content)
        return msg

    def _get_other_participants(self):
        conv = Conversation.objects.get(pk=self.conversation_id)
        return list(conv.participants.exclude(pk=self.user.pk).values_list('pk', flat=True))

    async def chat_message(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message'],
        })


class NotificationsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or self.user.is_anonymous:
            await self.close()
            return
        self.group_name = f'user_{self.user.pk}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notify_message(self, event):
        await self.send_json({
            'type': 'notify',
            'conversation_id': event.get('conversation_id'),
            'message': event.get('message'),
        })
