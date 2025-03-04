# Generated by Django 5.1.4 on 2025-02-17 03:28

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FitHub', '0002_remove_workoutexercise_duration_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workoutexercise',
            name='equipment',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='gif_url',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='instructions',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='secondary_muscles',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='target',
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='exercise_id',
            field=models.CharField(default=1, max_length=100),
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='start_date',
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='total_calories',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='total_time',
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='workout',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='exercises', to='FitHub.workout'),
        ),
        migrations.AlterField(
            model_name='exerciseperformance',
            name='workout_exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='performance', to='FitHub.workoutexercise'),
        ),
        migrations.AlterField(
            model_name='workoutexercise',
            name='body_part',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='workoutexercise',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='workoutexercise',
            name='name',
            field=models.CharField(max_length=200),
        ),
    ]
