from django.urls import path
from .views import (
    ConversationListCreateAPIView,
    MessageDetailAPIView,
    MessageListCreateAPIView,
    UserBlockAPIView,
    UserReportAPIView,
)

urlpatterns = [
    path('conversations/', ConversationListCreateAPIView.as_view(), name='conversations-list-create'),
    path('conversations/<int:pk>/messages/', MessageListCreateAPIView.as_view(), name='messages-list-create'),
    path('messages/<int:message_id>/', MessageDetailAPIView.as_view(), name='message-detail'),
    path('users/<int:user_id>/block/', UserBlockAPIView.as_view(), name='user-block'),
    path('users/<int:user_id>/report/', UserReportAPIView.as_view(), name='user-report'),
]
