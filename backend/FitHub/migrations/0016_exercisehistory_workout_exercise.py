# Generated by Django 5.1.4 on 2025-05-22 05:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FitHub', '0015_exercise_met'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercisehistory',
            name='workout_exercise',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='exercise_histories', to='FitHub.workoutexercise'),
        ),
    ]
