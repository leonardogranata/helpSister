from django.urls import path
from . import api

urlpatterns = [
    path('login/', api.login_api, name='api_login'),
    path('register/', api.register_api, name='api_register'),
    path('me/', api.me_api, name='api_me'),
]
