from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = (
        "id",
        "full_name",
        "username",
        "email",
        "user_type",
        "cpf",
        "phone",
        "birth_date",
        "city",
        "zip_code",
        "street",
        "number",
        "neighborhood",
        "service_radius",
        "pix_key",
        "is_staff",
        "is_superuser",
        "is_active",
    )
    list_filter = ("user_type", "is_staff", "is_superuser", "is_active", "city")
    search_fields = ("first_name", "last_name", "email", "username", "cpf", "phone", "city", "zip_code")
    ordering = ("id",)

    fieldsets = (
        ("Autenticacao", {"fields": ("username", "password")}),
        (
            "Dados basicos",
            {"fields": ("first_name", "last_name", "email", "user_type", "profile_picture", "blocked_users")},
        ),
        ("Dados pessoais", {"fields": ("cpf", "phone", "birth_date")}),
        ("Localizacao", {"fields": ("city", "zip_code", "street", "number", "neighborhood")}),
        ("Dados de cuidadora", {"fields": ("service_radius", "pix_key")}),
        ("Permissoes", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Datas importantes", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "user_type", "is_staff", "is_superuser"),
            },
        ),
    )

    @admin.display(description="Nome completo")
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or "-"
