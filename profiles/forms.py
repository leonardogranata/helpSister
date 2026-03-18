from django import forms

from .models import BabysitterProfile


class BabysitterProfileForm(forms.ModelForm):
    class Meta:
        model = BabysitterProfile
        fields = ["street", "number", "neighborhood", "service_radius", "pix_key"]
