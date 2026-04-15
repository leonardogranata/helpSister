from django import forms
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
import io
import os
from PIL import Image, UnidentifiedImageError
import re

from .models import User
from profiles.models import BabysitterProfile, ContractorProfile
from .cpf import validar_cpf, limpar_cpf


class BaseRegisterForm(forms.ModelForm):
    profile_picture = forms.FileField(
        required=False,
        label="Foto de perfil",
        widget=forms.ClearableFileInput(attrs={"accept": "image/*"}),
    )
    password = forms.CharField(widget=forms.PasswordInput, label="Senha")
    confirm_password = forms.CharField(widget=forms.PasswordInput, label="Confirmar senha")

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "cpf",
            "birth_date",
            "profile_picture",
            "zip_code",
            "street",
            "neighborhood",
            "city",
            "state",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name in self.Meta.fields:
            self.fields[name].required = True

        self.fields["profile_picture"].required = False
        self.fields["state"].max_length = 2
        self.fields["password"].required = True
        self.fields["confirm_password"].required = True

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if email and User.objects.filter(email=email).exists():
            raise ValidationError("Esse email ja esta em uso.")
        return email

    def clean_cpf(self):
        cpf_raw = self.cleaned_data.get("cpf")
        cpf = limpar_cpf(cpf_raw)
        if not cpf or len(cpf) != 11:
            raise ValidationError("CPF inválido.")
        
        if User.objects.filter(cpf=cpf).exists():
            raise ValidationError("CPF já cadastrado.")
        
        existing = User.objects.exclude(cpf__isnull=True).exclude(cpf__exact="")
        for u in existing:
            if re.sub(r"\D", "", u.cpf or "") == cpf:
                raise ValidationError("CPF já cadastrado.")
        
        if not validar_cpf(cpf):
            raise ValidationError("CPF inválido.")
        return cpf

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password and confirm_password and password != confirm_password:
            raise ValidationError("As senhas nao coincidem.")
        return cleaned_data

    def clean_state(self):
        state = self.cleaned_data.get("state", "")
        return (state or "").upper()

    def clean_profile_picture(self):
        arquivo = self.cleaned_data.get("profile_picture")
        if not arquivo:
            return None

        try:
            arquivo.seek(0)
            imagem = Image.open(arquivo)
            imagem.verify()
        except (UnidentifiedImageError, OSError, ValueError):
            return None

        try:
            arquivo.seek(0)
            imagem = Image.open(arquivo)
            imagem = imagem.convert("RGB")
            output = io.BytesIO()
            imagem.save(output, format="JPEG", quality=85)
            output.seek(0)

            name_root, _ = os.path.splitext(arquivo.name or "profile")
            new_name = f"{name_root}.jpg"

            new_file = InMemoryUploadedFile(
                output,
                "profile_picture",
                new_name,
                "image/jpeg",
                output.getbuffer().nbytes,
                None,
            )
            return new_file
        except Exception:
            return None

    def save_user(self, user_type):
        user = super().save(commit=False)
        user.username = user.email
        user.user_type = user_type
        user.set_password(self.cleaned_data["password"])
        cpf = self.cleaned_data.get("cpf")
        if cpf and validar_cpf(cpf):
            user.cpf_validated = True
        user.save()
        return user


class ContractorRegisterForm(BaseRegisterForm):
    def save(self):
        user = self.save_user("contractor")
        ContractorProfile.objects.get_or_create(user=user)
        return user


class BabysitterRegisterForm(BaseRegisterForm):
    street = forms.CharField(label="Rua", required=True)
    number = forms.CharField(label="Numero", required=True)
    neighborhood = forms.CharField(label="Bairro", required=True)
    service_radius = forms.IntegerField(label="Raio de atendimento (km)", required=True, min_value=0)
    pix_key = forms.CharField(label="Chave PIX", required=True)

    def save(self):
        user = self.save_user("babysitter")
        
        user.number = self.cleaned_data.get("number", "")
        user.service_radius = self.cleaned_data.get("service_radius")
        user.pix_key = self.cleaned_data.get("pix_key", "")
        user.save(update_fields=["number", "service_radius", "pix_key"])
        
        BabysitterProfile.objects.get_or_create(
            user=user,
            defaults={"bio": "", "title": "Babá profissional", "linkedin": "", "housing_available": False},
        )
        return user
