from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

from accounts.blocking import is_blocked_between
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
        can_send = await database_sync_to_async(self._can_send_message)()
        if not can_send:
            await self.send_json({
                'type': 'error',
                'detail': 'Nao e possivel enviar mensagem para usuario bloqueado.',
            })
            return
        msg = await database_sync_to_async(self._create_message)(content)
        serialized = await database_sync_to_async(self._serialize_message)(msg.id)
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chat.message',
            'message': serialized,
            'conversation_id': self.conversation_id,
        })
        participants = await database_sync_to_async(self._get_other_participants)()
        for pid in participants:
            await self.channel_layer.group_send(f'user_{pid}', {
                'type': 'notify.message',
                'event': 'message_created',
                'conversation_id': self.conversation_id,
                'message': serialized,
            })

    def _can_send_message(self):
        conv = Conversation.objects.prefetch_related('participants').get(pk=self.conversation_id)
        for participant in conv.participants.exclude(pk=self.user.pk):
            if is_blocked_between(self.user, participant):
                return False
        return True

    def _create_message(self, content):
        conv = Conversation.objects.get(pk=self.conversation_id)
        msg = Message.objects.create(conversation=conv, sender=self.user, content=content)
        msg.read_by.add(self.user)
        conv.save(update_fields=['updated_at'])
        return msg

    def _serialize_message(self, message_id):
        msg = Message.objects.select_related('sender').get(pk=message_id)
        return MessageSerializer(msg).data

    def _get_other_participants(self):
        conv = Conversation.objects.get(pk=self.conversation_id)
        return list(conv.participants.exclude(pk=self.user.pk).values_list('pk', flat=True))

    async def chat_message(self, event):
        message = event['message']
        sender_id = message.get('sender', {}).get('id')
        message_id = message.get('id')

        # If user is inside this conversation and receives someone else's message,
        # mark it as read immediately.
        if sender_id and sender_id != self.user.id and message_id:
            marked = await database_sync_to_async(self._mark_message_as_read)(message_id)
            if marked:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'chat.read',
                    'conversation_id': self.conversation_id,
                    'message_ids': [message_id],
                    'reader_id': self.user.id,
                })

        await self.send_json({
            'type': 'message',
            'message': message,
        })

    def _mark_message_as_read(self, message_id):
        try:
            msg = Message.objects.get(pk=message_id)
            if msg.read_by.filter(pk=self.user.pk).exists():
                return False
            msg.read_by.add(self.user)
            return True
        except Message.DoesNotExist:
            return False

    async def chat_message_updated(self, event):
        await self.send_json({
            'type': 'message_updated',
            'conversation_id': event.get('conversation_id'),
            'message': event.get('message'),
        })

    async def chat_message_deleted(self, event):
        await self.send_json({
            'type': 'message_deleted',
            'conversation_id': event.get('conversation_id'),
            'message': event.get('message'),
        })

    async def chat_read(self, event):
        await self.send_json({
            'type': 'read_receipt',
            'conversation_id': event.get('conversation_id'),
            'message_ids': event.get('message_ids', []),
            'reader_id': event.get('reader_id'),
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
            'event': event.get('event', 'message_created'),
            'conversation_id': event.get('conversation_id'),
            'message': event.get('message'),
        })
