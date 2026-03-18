from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect, render
from .forms import BabysitterRegisterForm, ContractorRegisterForm


def auth(request):
    return render(request, "auth.html")


def register(request):
    if request.method == "POST":
        return redirect("auth")
    return redirect("auth")


def loginView(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]

        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return redirect("dashboardRedirect")

    return redirect("auth")


def logoutView(request):
    logout(request)
    return redirect("auth")


def registerBabysitter(request):
    if request.method == "POST":
        form = BabysitterRegisterForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("dashboardRedirect")
    else:
        form = BabysitterRegisterForm()

    return render(request, "register_babysitter.html", {"form": form})


def registerContractor(request):
    if request.method == "POST":
        form = ContractorRegisterForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("dashboardRedirect")
    else:
        form = ContractorRegisterForm()

    return render(request, "register_contractor.html", {"form": form})
