# Generated by Django 5.1.4 on 2025-04-10 01:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FitHub', '0004_alter_exercise_secondary'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='activity_level',
            field=models.CharField(choices=[('sedentary', 'Sedentary (little or no exercise)'), ('light', 'Light (light exercise/sports 1-3 days/week)'), ('moderate', 'Moderate (moderate exercise/sports 3-5 days/week)'), ('active', 'Active (hard exercise/sports 6-7 days/week)'), ('very active', 'Very Active (very hard exercise/physical job)')], default='moderate', max_length=20),
        ),
    ]
