from django.urls import path
from .views import ConversationListCreateAPIView, MessageListCreateAPIView

urlpatterns = [
    path('conversations/', ConversationListCreateAPIView.as_view(), name='conversations-list-create'),
    path('conversations/<int:pk>/messages/', MessageListCreateAPIView.as_view(), name='messages-list-create'),
]
