from django.shortcuts import render


def profile_index(request):
    return render(request, "index.html")
