from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationListCreateAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        qs = Conversation.objects.filter(participants=request.user).order_by('-updated_at')
        serializer = ConversationSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        other_user_id = request.data.get('other_user_id')
        other_user = get_object_or_404(User, pk=other_user_id)
        conv = None
        for c in Conversation.objects.filter(participants=request.user).filter(participants=other_user):
            if c.participants.count() == 2:
                conv = c
                break
        if not conv:
            conv = Conversation.objects.create()
            conv.participants.add(request.user, other_user)
            conv.save()
        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data)


class MessageListCreateAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if not conv.participants.filter(pk=request.user.pk).exists():
            return Response({'detail': 'Not in conversation'}, status=403)
        qs = conv.messages.order_by('timestamp')
        serializer = MessageSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if not conv.participants.filter(pk=request.user.pk).exists():
            return Response({'detail': 'Not in conversation'}, status=403)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'Empty message'}, status=400)
        msg = Message.objects.create(conversation=conv, sender=request.user, content=content)
        layer = get_channel_layer()
        data = {
            'type': 'chat.message',
            'message': MessageSerializer(msg).data,
            'conversation_id': conv.id,
        }
        async_to_sync(layer.group_send)(f'chat_{conv.id}', data)
        for participant in conv.participants.exclude(pk=request.user.pk):
            async_to_sync(layer.group_send)(f'user_{participant.pk}', {
                'type': 'notify.message',
                'conversation_id': conv.id,
                'message': MessageSerializer(msg).data,
            })
        serializer = MessageSerializer(msg)
        return Response(serializer.data)
