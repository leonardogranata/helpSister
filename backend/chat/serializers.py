from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Conversation, Message

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_picture_url')


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender', 'content', 'timestamp')


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSimpleSerializer(many=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'last_message', 'unread_count')

    def get_last_message(self, obj):
        last = obj.last_message()
        if not last:
            return None
        return MessageSerializer(last).data

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return 0
        return obj.messages.exclude(read_by=request.user).exclude(sender=request.user).count()
