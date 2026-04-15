from django.contrib import admin

from .models import (
    BabysitterProfile, ContractorProfile,
    BabysitterExperience, BabysitterSchedule, BabysitterTraining,
    BabysitterBehavior, BabysitterActivities, BabysitterPersonalTraits,
    BabysitterReview,
)


@admin.register(BabysitterProfile)
class BabysitterProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'full_name', 'email', 'title', 'linkedin', 'housing_available', 'completion_percentage')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    fieldsets = (
        ('Usuário', {'fields': ('user',)}),
        ('Perfil', {'fields': ('bio', 'title', 'linkedin', 'housing_available')}),
    )

    @admin.display(description='Nome completo')
    def full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or '-'

    @admin.display(description='Email')
    def email(self, obj):
        return obj.user.email

    @admin.display(description='Completude %')
    def completion_percentage(self, obj):
        return f"{obj.completion_percentage}%"


@admin.register(ContractorProfile)
class ContractorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'full_name', 'email')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')

    @admin.display(description='Nome completo')
    def full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or '-'

    @admin.display(description='Email')
    def email(self, obj):
        return obj.user.email


@admin.register(BabysitterExperience)
class BabysitterExperienceAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter', 'title', 'employer', 'start_date', 'is_current')
    list_filter = ('is_current',)
    search_fields = ('babysitter__email', 'title', 'employer')


@admin.register(BabysitterSchedule)
class BabysitterScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter', 'day_of_week', 'morning', 'afternoon', 'evening', 'overnight')
    list_filter = ('day_of_week',)


@admin.register(BabysitterTraining)
class BabysitterTrainingAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter', 'title', 'completed')
    list_filter = ('completed',)
    search_fields = ('babysitter__email', 'title')


@admin.register(BabysitterBehavior)
class BabysitterBehaviorAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter')
    search_fields = ('babysitter__email',)


@admin.register(BabysitterActivities)
class BabysitterActivitiesAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter', 'reading', 'educational_toys', 'outdoor', 'arts', 'music')


@admin.register(BabysitterPersonalTraits)
class BabysitterPersonalTraitsAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter', 'organized', 'patient', 'creative', 'attentive', 'playful')


@admin.register(BabysitterReview)
class BabysitterReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'babysitter', 'reviewer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('babysitter__email', 'reviewer__email')
