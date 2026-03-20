from django.urls import path
from .views import *

urlpatterns = [
    path('auth/', auth, name='auth'),
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),

    path('register/babysitter/', registerBabysitter, name='registerBabysitter'),
    path('register/contractor/', registerContractor, name='registerContractor'),
]
