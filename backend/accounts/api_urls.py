from django.urls import path
from . import api

urlpatterns = [
    path('login/', api.login_api, name='api_login'),
    path('register/', api.register_api, name='api_register'),
    path('validate-cpf/', api.validate_cpf_api, name='api_validate_cpf'),
    path('me/', api.me_api, name='api_me'),
]
