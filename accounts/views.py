from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .models import User

def auth(request):
    return render(request, 'auth.html')

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        user_type = request.POST['user_type']

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type
        )

        login(request, user)
        return redirect('dashboardRedirect')

def loginView(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = authenticate(request, username=email, password=password)

        if user:
            login(request, user)
            return redirect('dashboardRedirect')

    return redirect('auth')

def logoutView(request):
    logout(request)
    return redirect('auth')




def registerBabysitter(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            user_type='babysitter'
        )

        login(request, user)
        return redirect('babysitterDashboard')

    return render(request, 'register_babysitter.html')


def registerContractor(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            user_type='contractor'
        )

        login(request, user)
        return redirect('contractorDashboard')

    return render(request, 'register_contractor.html')

