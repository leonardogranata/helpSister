import re
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from cep import buscar_dados_cep

from .forms import BabysitterRegisterForm, ContractorRegisterForm


def _normalize_user_type(value: str) -> str:
    if not value:
        return 'contractor'
    v = str(value).lower()
    if v in ('cuidadora', 'babysitter'):
        return 'babysitter'
    if v in ('contratante', 'contractor'):
        return 'contractor'
    return 'contractor'


def _normalize_register_payload(request):
    data = request.data.copy()
    files = request.FILES.copy()

    if not data.get('confirm_password') and data.get('password_confirm'):
        data['confirm_password'] = data.get('password_confirm')

    if not data.get('zip_code') and data.get('cep'):
        data['zip_code'] = data.get('cep')

    if not data.get('number') and data.get('address_number'):
        data['number'] = data.get('address_number')

    if not data.get('service_radius') and data.get('service_radius_km'):
        data['service_radius'] = data.get('service_radius_km')

    if 'profile_picture' not in files and 'profile_photo' in request.FILES:
        files['profile_picture'] = request.FILES['profile_photo']

    zip_code = data.get('zip_code') or ''
    zip_digits = re.sub(r"\D", "", zip_code)
    if len(zip_digits) == 8:
        data['zip_code'] = f'{zip_digits[:5]}-{zip_digits[5:]}'
        cep_data = buscar_dados_cep(zip_digits)
        if cep_data:
            if not data.get('street'):
                data['street'] = cep_data.get('logradouro') or 'Nao informado'
            if not data.get('neighborhood'):
                data['neighborhood'] = cep_data.get('bairro') or 'Nao informado'
            if not data.get('city'):
                data['city'] = cep_data.get('cidade') or 'Nao informado'
            if not data.get('state'):
                data['state'] = (cep_data.get('estado') or 'NA').upper()[:2]

    if not data.get('street'):
        data['street'] = 'Nao informado'
    if not data.get('neighborhood'):
        data['neighborhood'] = 'Nao informado'
    if not data.get('city'):
        data['city'] = 'Nao informado'
    if not data.get('state'):
        data['state'] = 'NA'

    return data, files


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([JSONParser])
def login_api(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'detail': 'Email e senha nescessários.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response({'detail': 'Credenciais Inválidas.'}, status=status.HTTP_400_BAD_REQUEST)

    requested_user_type = request.data.get('user_type')
    if requested_user_type and user.user_type != _normalize_user_type(requested_user_type):
        return Response({'detail': 'Usuário não encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    user_data = {
        'id': user.id,
        'name': f"{user.first_name} {user.last_name}".strip(),
        'email': user.email,
        'user_type': user.user_type,
    }
    return Response({'token': token.key, 'user': user_data})


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def register_api(request):
    data, files = _normalize_register_payload(request)
    user_type_raw = data.get('user_type')
    user_type = _normalize_user_type(user_type_raw)

    if user_type == 'babysitter':
        if not data.get('number'):
            data['number'] = 'S/N'
        if not data.get('service_radius'):
            data['service_radius'] = '5'
        if not data.get('pix_key'):
            data['pix_key'] = data.get('cpf') or data.get('email') or 'nao-informado'
        form = BabysitterRegisterForm(data, files)
    else:
        form = ContractorRegisterForm(data, files)

    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    user = form.save()
    token, _ = Token.objects.get_or_create(user=user)
    user_data = {
        'id': user.id,
        'name': f"{user.first_name} {user.last_name}".strip(),
        'email': user.email,
        'user_type': user.user_type,
    }
    return Response({'token': token.key, 'user': user_data}, status=status.HTTP_201_CREATED)
