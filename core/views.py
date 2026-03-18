from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

def index(request):
    return render(request, 'index.html')

def dashboardRedirect(request):
    user = request.user

    if user.user_type == 'babysitter':
        return redirect('babysitterDashboard')
    else:
        return redirect('contractorDashboard')

@login_required
def babysitterDashboard(request):
    return render(request, 'babysitter.html')

@login_required
def contractorDashboard(request):
    return render(request, 'contractor.html')
