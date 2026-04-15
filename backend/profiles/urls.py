from django.urls import path
from . import views

urlpatterns = [
    # My own profile (auth required)
    path('babysitter/me/', views.babysitter_my_profile, name='babysitter-my-profile'),

    # Experiences
    path('babysitter/me/experiences/', views.experiences_list, name='experiences-list'),
    path('babysitter/me/experiences/<int:pk>/', views.experience_detail, name='experience-detail'),

    # Schedule / availability
    path('babysitter/me/schedule/', views.schedule, name='schedule'),

    # Training / capacitação
    path('babysitter/me/trainings/', views.trainings_list, name='trainings-list'),
    path('babysitter/me/trainings/<int:pk>/', views.training_detail, name='training-detail'),

    # Behavior
    path('babysitter/me/behavior/', views.behavior, name='behavior'),

    # Activities
    path('babysitter/me/activities/', views.activities, name='activities'),

    # Personal traits
    path('babysitter/me/personal-traits/', views.personal_traits, name='personal-traits'),

    # Reviews (contractor posts a review for a babysitter)
    path('babysitter/<int:babysitter_id>/reviews/', views.add_review, name='add-review'),

    # Public profile (anyone can view)
    path('babysitter/<int:user_id>/', views.babysitter_public_profile, name='babysitter-public-profile'),
]
