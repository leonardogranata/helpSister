from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_alter_user_profile_picture"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="state",
            field=models.CharField(blank=True, default="", max_length=2),
        ),
    ]
