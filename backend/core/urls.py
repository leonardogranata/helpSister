from django.urls import path
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('dashboard/', dashboardRedirect, name='dashboardRedirect'),
    path('dashboard/babysitter/', babysitterDashboard, name='babysitterDashboard'),
    path('dashboard/contractor/', contractorDashboard, name='contractorDashboard'),
]
