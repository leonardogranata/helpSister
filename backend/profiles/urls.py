from django.urls import path
from . import views

urlpatterns = [
    path('babysitters/', views.babysitter_public_profiles_list, name='babysitter-public-profiles-list'),
    path('babysitter/me/', views.babysitter_my_profile, name='babysitter-my-profile'),
    path('babysitter/me/experiences/', views.experiences_list, name='experiences-list'),
    path('babysitter/me/experiences/<int:pk>/', views.experience_detail, name='experience-detail'),
    path('babysitter/me/schedule/', views.schedule, name='schedule'),
    path('babysitter/me/trainings/', views.trainings_list, name='trainings-list'),
    path('babysitter/me/trainings/<int:pk>/', views.training_detail, name='training-detail'),
    path('babysitter/me/behavior/', views.behavior, name='behavior'),
    path('babysitter/me/activities/', views.activities, name='activities'),
    path('babysitter/me/personal-traits/', views.personal_traits, name='personal-traits'),
    path('babysitter/<int:babysitter_id>/reviews/', views.add_review, name='add-review'),
    path('babysitter/<int:user_id>/', views.babysitter_public_profile, name='babysitter-public-profile'),
]
