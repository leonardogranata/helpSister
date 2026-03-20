from django.contrib import admin

from .models import BabysitterProfile, ContractorProfile


@admin.register(BabysitterProfile)
class BabysitterProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "email",
        "street",
        "number",
        "neighborhood",
        "service_radius",
        "pix_key",
    )
    search_fields = ("user__first_name", "user__last_name", "user__email", "street", "neighborhood", "pix_key")
    fieldsets = (
        ("Usuario", {"fields": ("user",)}),
        ("Endereco", {"fields": ("street", "number", "neighborhood")}),
        ("Atendimento", {"fields": ("service_radius", "pix_key")}),
    )

    @admin.display(description="Nome completo")
    def full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or "-"

    @admin.display(description="Email")
    def email(self, obj):
        return obj.user.email


@admin.register(ContractorProfile)
class ContractorProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "full_name", "email")
    search_fields = ("user__first_name", "user__last_name", "user__email")
    fieldsets = (("Usuario", {"fields": ("user",)}),)

    @admin.display(description="Nome completo")
    def full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or "-"

    @admin.display(description="Email")
    def email(self, obj):
        return obj.user.email
