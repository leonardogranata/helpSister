from django.conf import settings
from django.db import models


class ContractorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='contractor_profile',
    )

    def __str__(self):
        return self.user.email


class BabysitterProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='babysitter_profile',
    )
    bio = models.TextField(blank=True, default='')
    title = models.CharField(max_length=200, blank=True, default='Babá profissional')
    linkedin = models.CharField(max_length=255, blank=True, default='')
    housing_available = models.BooleanField(default=False)

    def __str__(self):
        return f"Perfil de {self.user.email}"

    @property
    def completion_percentage(self):
        score = 0
        user = self.user

        # Photo (10%)
        if user.profile_picture:
            score += 10

        # Bio (10%)
        if self.bio and len(self.bio.strip()) > 20:
            score += 10

        # Title customised (5%)
        if self.title and self.title.strip() and self.title != 'Babá profissional':
            score += 5

        # LinkedIn (5%)
        if self.linkedin and self.linkedin.strip():
            score += 5

        # Location (5%)
        if user.city and user.state:
            score += 5

        # Experiences (20%)
        if user.experiences.exists():
            score += 20

        # Availability (15%)
        if user.schedules.exists():
            score += 15

        # Training (10%)
        if user.trainings.exists():
            score += 10

        # Behavior (10%)
        try:
            b = user.behavior
            if any([b.family_orientation, b.playtime, b.flexibility,
                    b.parent_communication, b.daily_routine]):
                score += 10
        except Exception:
            pass

        # Activities (5%)
        if hasattr(user, 'activities'):
            score += 5

        # Personal traits (5%)
        if hasattr(user, 'personal_traits'):
            score += 5

        return score


class BabysitterExperience(models.Model):
    babysitter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='experiences',
    )
    title = models.CharField(max_length=200)
    employer = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, default='')
    # List of strings e.g. ["0-2", "3-6", "7-10", "11-14"]
    age_ranges = models.JSONField(default=list)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.title} – {self.employer}"


class BabysitterSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Segunda'),
        (1, 'Terça'),
        (2, 'Quarta'),
        (3, 'Quinta'),
        (4, 'Sexta'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    babysitter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='schedules',
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    morning = models.BooleanField(default=False)
    afternoon = models.BooleanField(default=False)
    evening = models.BooleanField(default=False)
    overnight = models.BooleanField(default=False)

    class Meta:
        unique_together = ('babysitter', 'day_of_week')
        ordering = ['day_of_week']

    def __str__(self):
        return f"{self.babysitter.email} – {self.get_day_of_week_display()}"


class BabysitterTraining(models.Model):
    babysitter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trainings',
    )
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500, blank=True, default='')
    completed = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} – {self.babysitter.email}"


class BabysitterBehavior(models.Model):
    babysitter = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='behavior',
    )
    family_orientation = models.TextField(blank=True, default='')
    playtime = models.TextField(blank=True, default='')
    flexibility = models.TextField(blank=True, default='')
    parent_communication = models.TextField(blank=True, default='')
    daily_routine = models.TextField(blank=True, default='')
    situation_dilemma = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Comportamento de {self.babysitter.email}"


class BabysitterActivities(models.Model):
    babysitter = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities',
    )
    reading = models.BooleanField(default=False)
    educational_toys = models.BooleanField(default=False)
    outdoor = models.BooleanField(default=False)
    social_skills = models.BooleanField(default=False)
    arts = models.BooleanField(default=False)
    cooking = models.BooleanField(default=False)
    music = models.BooleanField(default=False)
    crafts = models.BooleanField(default=False)

    def __str__(self):
        return f"Atividades de {self.babysitter.email}"


class BabysitterPersonalTraits(models.Model):
    babysitter = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='personal_traits',
    )
    organized = models.IntegerField(default=3)   # 1–5
    patient = models.IntegerField(default=3)
    creative = models.IntegerField(default=3)
    attentive = models.IntegerField(default=3)
    playful = models.IntegerField(default=3)
    bio_quote = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Traits de {self.babysitter.email}"


class BabysitterReview(models.Model):
    babysitter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reviews',
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_reviews',
    )
    rating = models.IntegerField()  # 1–5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review de {self.reviewer.email} → {self.babysitter.email}"
