from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from accounts.blocking import is_blocked_between
from .models import Conversation, Message, UserReport
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


def _serialize_message(msg: Message) -> dict:
    return MessageSerializer(msg).data


def _notify_others(conv: Conversation, actor, payload: dict) -> None:
    layer = get_channel_layer()
    for participant in conv.participants.exclude(pk=actor.pk):
        async_to_sync(layer.group_send)(f"user_{participant.pk}", payload)


def _conversation_has_block(conv: Conversation, user) -> bool:
    for participant in conv.participants.exclude(pk=user.pk):
        if is_blocked_between(user, participant):
            return True
    return False


class ConversationListCreateAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        qs = (
            Conversation.objects.filter(participants=request.user)
            .prefetch_related("participants")
            .order_by("-updated_at")
        )
        serializer = ConversationSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        other_user_id = request.data.get("other_user_id")
        other_user = get_object_or_404(User, pk=other_user_id)

        if other_user.pk == request.user.pk:
            return Response({"detail": "Conversa invalida."}, status=400)

        if is_blocked_between(request.user, other_user):
            return Response(
                {"detail": "Nao e possivel iniciar conversa com usuario bloqueado."},
                status=403,
            )

        conv = None
        for c in (
            Conversation.objects.filter(participants=request.user)
            .filter(participants=other_user)
            .prefetch_related("participants")
        ):
            if c.participants.count() == 2:
                conv = c
                break

        if not conv:
            conv = Conversation.objects.create()
            conv.participants.add(request.user, other_user)
            conv.save()

        serializer = ConversationSerializer(conv, context={"request": request})
        return Response(serializer.data)


class MessageListCreateAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if not conv.participants.filter(pk=request.user.pk).exists():
            return Response({"detail": "Not in conversation"}, status=403)

        unread_qs = (
            conv.messages.exclude(sender=request.user)
            .exclude(read_by=request.user)
            .exclude(deleted_for_users=request.user)
            .exclude(is_deleted_for_all=True)
        )
        read_ids = list(unread_qs.values_list("id", flat=True))
        for msg in unread_qs:
            msg.read_by.add(request.user)

        if read_ids:
            layer = get_channel_layer()
            async_to_sync(layer.group_send)(
                f"chat_{conv.id}",
                {
                    "type": "chat.read",
                    "conversation_id": conv.id,
                    "message_ids": read_ids,
                    "reader_id": request.user.id,
                },
            )

        qs = conv.messages.exclude(deleted_for_users=request.user).order_by("timestamp")
        serializer = MessageSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if not conv.participants.filter(pk=request.user.pk).exists():
            return Response({"detail": "Not in conversation"}, status=403)

        if _conversation_has_block(conv, request.user):
            return Response(
                {"detail": "Nao e possivel enviar mensagem para usuario bloqueado."},
                status=403,
            )

        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Empty message"}, status=400)

        msg = Message.objects.create(conversation=conv, sender=request.user, content=content)
        msg.read_by.add(request.user)
        conv.save(update_fields=["updated_at"])
        serialized = _serialize_message(msg)

        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            f"chat_{conv.id}",
            {
                "type": "chat.message",
                "message": serialized,
                "conversation_id": conv.id,
            },
        )

        _notify_others(
            conv,
            request.user,
            {
                "type": "notify.message",
                "event": "message_created",
                "conversation_id": conv.id,
                "message": serialized,
            },
        )

        return Response(serialized)


class MessageDetailAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request, message_id):
        msg = get_object_or_404(
            Message.objects.select_related("conversation", "sender"),
            pk=message_id,
        )
        conv = msg.conversation
        if not conv.participants.filter(pk=request.user.pk).exists():
            return Response({"detail": "Not in conversation"}, status=403)
        if msg.sender_id != request.user.id:
            return Response({"detail": "Only sender can edit."}, status=403)
        if msg.is_deleted_for_all:
            return Response({"detail": "Message already deleted."}, status=400)

        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Empty message"}, status=400)

        msg.content = content
        msg.edited_at = timezone.now()
        msg.save(update_fields=["content", "edited_at"])
        conv.save(update_fields=["updated_at"])

        serialized = _serialize_message(msg)
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            f"chat_{conv.id}",
            {
                "type": "chat.message_updated",
                "conversation_id": conv.id,
                "message": serialized,
            },
        )
        _notify_others(
            conv,
            request.user,
            {
                "type": "notify.message",
                "event": "message_updated",
                "conversation_id": conv.id,
                "message": serialized,
            },
        )
        return Response(serialized)

    def delete(self, request, message_id):
        msg = get_object_or_404(
            Message.objects.select_related("conversation", "sender"),
            pk=message_id,
        )
        conv = msg.conversation
        if not conv.participants.filter(pk=request.user.pk).exists():
            return Response({"detail": "Not in conversation"}, status=403)

        scope = (request.query_params.get("scope") or "me").lower()
        if scope not in ("me", "all"):
            return Response({"detail": "Invalid scope."}, status=400)

        if scope == "me":
            msg.deleted_for_users.add(request.user)
            return Response(
                {
                    "detail": "Mensagem removida para voce.",
                    "scope": "me",
                    "message_id": msg.id,
                }
            )

        if msg.sender_id != request.user.id:
            return Response({"detail": "Only sender can delete for all."}, status=403)

        if not msg.is_deleted_for_all:
            msg.content = ""
            msg.is_deleted_for_all = True
            msg.deleted_at = timezone.now()
            msg.edited_at = None
            msg.save(update_fields=["content", "is_deleted_for_all", "deleted_at", "edited_at"])
            conv.save(update_fields=["updated_at"])

        serialized = _serialize_message(msg)
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            f"chat_{conv.id}",
            {
                "type": "chat.message_deleted",
                "conversation_id": conv.id,
                "message": serialized,
            },
        )
        _notify_others(
            conv,
            request.user,
            {
                "type": "notify.message",
                "event": "message_deleted",
                "conversation_id": conv.id,
                "message": serialized,
            },
        )
        return Response(serialized)


class UserBlockAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response({"detail": "Nao e possivel bloquear a si mesmo."}, status=400)

        target = get_object_or_404(User, pk=user_id)
        request.user.blocked_users.add(target)
        return Response(
            {
                "detail": "Usuario bloqueado com sucesso.",
                "blocked_user_id": target.id,
            }
        )

    def delete(self, request, user_id):
        if request.user.id == user_id:
            return Response({"detail": "Nao e possivel desbloquear a si mesmo."}, status=400)

        target = get_object_or_404(User, pk=user_id)
        request.user.blocked_users.remove(target)
        return Response(
            {
                "detail": "Usuario desbloqueado com sucesso.",
                "unblocked_user_id": target.id,
            }
        )


class UserReportAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response({"detail": "Nao e possivel denunciar a si mesmo."}, status=400)

        target = get_object_or_404(User, pk=user_id)

        conversation = None
        conversation_id = request.data.get("conversation_id")
        if conversation_id is not None:
            conversation = get_object_or_404(Conversation, pk=conversation_id)
            if not conversation.participants.filter(pk=request.user.pk).exists():
                return Response({"detail": "Conversa invalida."}, status=400)
            if not conversation.participants.filter(pk=target.pk).exists():
                return Response({"detail": "Conversa nao pertence ao usuario denunciado."}, status=400)

        reason = (request.data.get("reason") or "Outro").strip()[:120] or "Outro"
        details = (request.data.get("details") or "").strip()

        report = UserReport.objects.create(
            reporter=request.user,
            reported_user=target,
            conversation=conversation,
            reason=reason,
            details=details,
        )

        return Response(
            {
                "id": report.id,
                "detail": "Denuncia enviada para analise do admin.",
            },
            status=status.HTTP_201_CREATED,
        )
