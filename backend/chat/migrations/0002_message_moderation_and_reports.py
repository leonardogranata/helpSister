from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_user_blocked_users"),
        ("chat", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="deleted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="message",
            name="edited_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="message",
            name="is_deleted_for_all",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="message",
            name="deleted_for_users",
            field=models.ManyToManyField(
                blank=True,
                related_name="deleted_messages",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name="UserReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reason", models.CharField(default="Outro", max_length=120)),
                ("details", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("resolved", models.BooleanField(default=False)),
                (
                    "conversation",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="reports",
                        to="chat.conversation",
                    ),
                ),
                (
                    "reported_user",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="received_reports",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "reporter",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="sent_reports",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
