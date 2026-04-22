from django.contrib.auth.models import AbstractUser
from django.db import models
from django.templatetags.static import static


class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ("babysitter", "Baba"),
        ("contractor", "Contratante"),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default="contractor")

    email = models.EmailField("email address", unique=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    cpf_validated = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True, default="")
    birth_date = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to="profile_images/", null=True, blank=True)
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=2, blank=True, default="")
    zip_code = models.CharField(max_length=10, blank=True, default="")
    
    street = models.CharField(max_length=255, blank=True, null=True)
    number = models.CharField(max_length=10, blank=True, null=True)
    neighborhood = models.CharField(max_length=100, blank=True, null=True)
    service_radius = models.IntegerField(blank=True, null=True)
    pix_key = models.CharField(max_length=100, blank=True, null=True)
    blocked_users = models.ManyToManyField(
        "self",
        symmetrical=False,
        related_name="blocked_by",
        blank=True,
    )

    def __str__(self):
        return self.email

    @property
    def profile_picture_url(self):
        if self.profile_picture:
            try:
                return self.profile_picture.url
            except ValueError:
                pass
        return static("accounts/images/default_profile.png")

    def has_blocked(self, other_user):
        if not other_user:
            return False
        return self.blocked_users.filter(pk=other_user.pk).exists()
