from django.contrib import admin

from .models import Conversation, Message, UserReport


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "updated_at")
    search_fields = ("id", "participants__email")
    filter_horizontal = ("participants",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "sender",
        "timestamp",
        "is_deleted_for_all",
        "edited_at",
    )
    search_fields = ("id", "content", "sender__email", "conversation__id")
    list_filter = ("is_deleted_for_all", "timestamp")
    filter_horizontal = ("read_by", "deleted_for_users")


@admin.register(UserReport)
class UserReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "reporter",
        "reported_user",
        "reason",
        "conversation",
        "created_at",
        "resolved",
    )
    search_fields = ("reporter__email", "reported_user__email", "reason", "details")
    list_filter = ("resolved", "created_at")
