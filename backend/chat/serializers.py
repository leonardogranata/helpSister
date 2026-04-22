from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Conversation, Message

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'user_type', 'profile_picture_url')


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSimpleSerializer(read_only=True)
    read_by_ids = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id',
            'sender',
            'content',
            'timestamp',
            'edited_at',
            'deleted_at',
            'is_deleted_for_all',
            'is_edited',
            'read_by_ids',
        )

    def get_read_by_ids(self, obj):
        return list(obj.read_by.values_list('id', flat=True))

    def get_is_edited(self, obj):
        return bool(obj.edited_at)


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSimpleSerializer(many=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_blocked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'last_message', 'unread_count', 'is_blocked_by_me')

    def get_last_message(self, obj):
        request = self.context.get('request')
        qs = obj.messages.all()
        if request and request.user and not request.user.is_anonymous:
            qs = qs.exclude(deleted_for_users=request.user)
        last = qs.order_by('-timestamp').first()
        if not last:
            return None
        return MessageSerializer(last).data

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return 0
        return (
            obj.messages
            .exclude(read_by=request.user)
            .exclude(sender=request.user)
            .exclude(deleted_for_users=request.user)
            .exclude(is_deleted_for_all=True)
            .count()
        )

    def get_is_blocked_by_me(self, obj):
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return False
        other_ids = obj.participants.exclude(pk=request.user.pk).values_list('id', flat=True)
        return request.user.blocked_users.filter(id__in=other_ids).exists()
