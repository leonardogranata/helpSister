from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_user_state"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="cpf_validated",
            field=models.BooleanField(default=False),
        ),
    ]
