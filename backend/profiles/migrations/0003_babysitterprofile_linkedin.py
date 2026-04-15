from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0002_remove_babysitterprofile_neighborhood_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='babysitterprofile',
            name='linkedin',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
