from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import redirect, render

from cep import buscar_dados_cep

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


def lookupCep(request):
    cep = request.GET.get("cep", "")
    dados = buscar_dados_cep(cep)

    if not dados:
        return JsonResponse(
            {"ok": False, "message": "CEP invalido ou nao encontrado."},
            status=404,
        )

    return JsonResponse({"ok": True, "data": dados})
