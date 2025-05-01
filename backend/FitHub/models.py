import random
import requests
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.timezone import now, timedelta
from django.utils import timezone
from django.db.models import Sum
from django.conf import settings
from datetime import datetime
from collections import defaultdict

class CustomUserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and return a regular user with an email."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and return a superuser with an email."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, first_name, last_name, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    gender = models.CharField(max_length=10, choices=[('male','Male'),('female','Female')], null=True)
    goal = models.CharField(max_length=255)  # e.g., Weight Loss, Weight Gain
    goal_weight = models.FloatField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    goal_duration = models.CharField(
        max_length=20,
        choices=[(f'{i} month', f'{i} month') for i in range(1, 13)],
        null=True,
        blank=True,
    )
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary (little or no exercise)'),
        ('light', 'Light (light exercise/sports 1-3 days/week)'),
        ('moderate', 'Moderate (moderate exercise/sports 3-5 days/week)'),
        ('active', 'Active (hard exercise/sports 6-7 days/week)'),
        ('very active', 'Very Active (very hard exercise/physical job)'),
    ]
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, default='moderate')
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_calories(self, activity_level='moderate'):
        """
        Calculate daily calorie needs for weight loss or weight gain.
        """
        if self.gender == 'male':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        else:
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age - 161

        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very active': 1.9,
        }
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)

        weight_change = abs((self.goal_weight or self.weight) - self.weight)
        duration_in_days = int(self.goal_duration.split()[0]) * 30 if self.goal_duration else 90
        daily_adjustment = (weight_change * 7700) / duration_in_days if duration_in_days else 0

        if self.goal == 'Weight Loss':
            return {'weight_loss': round(tdee - daily_adjustment)}
        elif self.goal == 'Weight Gain':
            return {'weight_gain': round(tdee + daily_adjustment)}
        return {}

class OTP(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, default=False)
    email_sent = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    def generate_otp(self):
        otp = ''.join(str(random.randint(0, 9)) for _ in range(6))
        self.otp = otp
        self.expires_at = timezone.now() + timedelta(minutes=10)
        return otp

    def is_otp_valid(self, otp):
        return self.otp == otp and timezone.now() <= self.expires_at

class WorkoutLibrary(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="workout_libraries")
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.user.email}"

class Workout(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="workouts")
    workout_date = models.DateField(default=now)
    total_time = models.DurationField(null=True, blank=True)
    total_calories = models.FloatField(null=True, blank=True)
    workout_library = models.ForeignKey(WorkoutLibrary, on_delete=models.SET_NULL, null=True, blank=True)

    def calculate_total_calories(self):
        total = sum(ex.calculate_calories() for ex in self.exercises.all())
        self.total_calories = total
        self.save()
        return total

    def __str__(self):
        return f"Workout for {self.user.email} on {self.workout_date}"

class Exercise(models.Model):
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100, blank=True, null=True)  # e.g., "Strength", "Cardio"
    equipment = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    secondary = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    

class WorkoutExercise(models.Model):
    # Temporarily allow null so Django can migrate existing rows
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE,
        related_name="workout_entries",
        null=True,
        blank=True,
    )
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises", null=True, blank=True)
    start_date = models.DateField(default=now)
    total_time = models.DurationField(null=True, blank=True)
    total_calories = models.FloatField(default=0.0)

    def calculate_calories(self):
        """
        Calculate calories using external Calorie API via query parameters:
        - activity: exercise name
        - weight: user weight in pounds
        - duration: minutes performed
        """
        # Prepare params
        # assume weight stored in kg, convert to pounds
        weight_lbs = round(self.workout.user.weight * 2.20462)
        mins = int(self.total_time.total_seconds() / 60) if self.total_time else 60
        params = {
            'activity': self.exercise.name,
            'weight': weight_lbs,
            'duration': mins,
        }
        url = settings.CALORIE_API_URL 
        headers = {}
        # include API key if provided
        if hasattr(settings, 'CALORIE_API_KEY'):
            headers['Authorization'] = f"Bearer {settings.CALORIE_API_KEY}"

        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        total_cal = data.get('calories', 0)

        self.total_calories = total_cal
        self.save(update_fields=['total_calories'])
        return total_cal

    def __str__(self):
        return f"{self.exercise.name} on {self.workout.workout_date}"

class ExercisePerformance(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name="performance")
    set_number = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()

    def __str__(self):
        return f"{self.workout_exercise.exercise.name} - Set {self.set_number}: {self.reps} reps at {self.weight}kg"

class FavoriteExercise(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'exercise')

class MealPlan(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="meal_plans")
    meal = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    ingredients = models.JSONField()
    calories = models.IntegerField()
    dietary_restriction = models.CharField(max_length=50, blank=True, null=True)
    is_consumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.meal} - {self.name}"

class DailyCalorieSummary(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="daily_summaries")
    date = models.DateField(default=now)
    calories_consumed = models.FloatField(default=0.0)
    calories_burned = models.FloatField(default=0.0)
    net_calories = models.FloatField(default=0.0)

    def calculate_net_calories(self):
        # Total calories from workout and meals
        burned = Workout.objects.filter(user=self.user, workout_date=self.date).aggregate(total=Sum('total_calories'))['total'] or 0
        consumed = MealPlan.objects.filter(user=self.user, created_at__date=self.date).aggregate(total=Sum('calories'))['total'] or 0

        self.calories_burned = burned
        self.calories_consumed = consumed

        # User's base target calories (without exercise)
        data = self.user.calculate_calories(activity_level=self.user.activity_level)
        base_target = data.get('weight_loss') or data.get('weight_gain') or 0

        if self.user.goal == 'Weight Gain':
            adjusted_target = base_target + burned  # Gain needs to compensate burned calories
            self.net_calories = consumed - adjusted_target
        elif self.user.goal == 'Weight Loss':
            adjusted_target = base_target - burned  # Loss should consider burned calories
            self.net_calories = adjusted_target - consumed
        else:
            # For maintenance, simple balance
            self.net_calories = consumed - burned

        self.save()



class WorkoutLibraryExercise(models.Model):
    library = models.ForeignKey(WorkoutLibrary, on_delete=models.CASCADE, related_name="exercises")
    workout_exercise_id = models.IntegerField(default=1)  # Store API exercise ID
    name = models.CharField(max_length=200)  # Exercise name
    body_part = models.CharField(max_length=100, null=True)  # Muscle group

    def __str__(self):
        return f"{self.name} in {self.library.name}"
    


class ExerciseHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='exercise_histories')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='exercise_histories')
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='exercise_histories')
    date = models.DateField(default=now)
    sets = models.IntegerField(default=1)
    reps_per_set = models.IntegerField(default=8)
    weight_per_set = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    def total_volume(self):
        return self.sets * self.reps_per_set * self.weight_per_set

    def __str__(self):
        return f"{self.user.email} - {self.exercise.name} on {self.date}"
    
def get_top_exercises(user, top_n=10):
        """
        Returns top N exercises based on total volume (reps * weight) for the given user,
        including exercise ID, name, photo, and primary muscle.
        """
        from django.db.models import Sum, F, FloatField, ExpressionWrapper

        performances = (
            ExercisePerformance.objects
            .filter(workout_exercise__workout__user=user)
            .annotate(volume=ExpressionWrapper(
                F('reps') * F('weight'),
                output_field=FloatField()
            ))
            .values(
                'workout_exercise__exercise__id',
                'workout_exercise__exercise__name',
                'workout_exercise__exercise__category',
            )
            .annotate(total_volume=Sum('volume'))
            .order_by('-total_volume')[:top_n]
        )

        return performances
