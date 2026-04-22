from django.conf import settings
from django.db import models


class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Conversation {self.id}'

    def last_message(self):
        return self.messages.order_by('-timestamp').first()


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted_for_all = models.BooleanField(default=False)
    read_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='read_messages', blank=True)
    deleted_for_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='deleted_messages',
        blank=True,
    )

    def __str__(self):
        return f'Message {self.id} in Conversation {self.conversation_id}'


class UserReport(models.Model):
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='sent_reports',
        on_delete=models.CASCADE,
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_reports',
        on_delete=models.CASCADE,
    )
    conversation = models.ForeignKey(
        Conversation,
        related_name='reports',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    reason = models.CharField(max_length=120, default='Outro')
    details = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f'Report {self.id}: {self.reporter_id} -> {self.reported_user_id}'
