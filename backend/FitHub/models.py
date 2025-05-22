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
from django.db.models import Sum, Avg, Count
from datetime import timedelta, date


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

    def calculate_calories(self, activity_level=None):
        activity_level = activity_level or self.activity_level
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

    def get_estimated_current_weight(self):
        """
        Estimate current weight based on net calories consumed over time.
        7700 kcal ≈ 1 kg weight change.
        """
        total_net_calories = self.daily_summaries.aggregate(total=Sum('net_calories'))['total'] or 0
        weight_change = total_net_calories / 7700.0
        estimated_weight = round(self.weight + weight_change, 2)
        return estimated_weight

    def get_calorie_trend(self, days=30):
        """
        Returns daily average calories consumed, burned, and net calories for past `days`.
        """
        from django.db.models.functions import TruncDate

        start_date = date.today() - timedelta(days=days)
        summaries = self.daily_summaries.filter(date__gte=start_date).order_by('date')

        trend_data = []
        for day in (start_date + timedelta(n) for n in range(days)):
            day_summary = summaries.filter(date=day).first()
            if day_summary:
                trend_data.append({
                    'date': day,
                    'calories_consumed': day_summary.calories_consumed,
                    'calories_burned': day_summary.calories_burned,
                    'net_calories': day_summary.net_calories,
                })
            else:
                trend_data.append({
                    'date': day,
                    'calories_consumed': 0,
                    'calories_burned': 0,
                    'net_calories': 0,
                })
        return trend_data

    def get_workout_trend(self, days=30):
        """
        Returns daily workout counts and calories burned for the past `days`.
        """
        start_date = date.today() - timedelta(days=days)
        workouts = self.workouts.filter(workout_date__gte=start_date)

        daily_data = defaultdict(lambda: {'workout_count': 0, 'calories_burned': 0})

        for workout in workouts:
            day = workout.workout_date
            daily_data[day]['workout_count'] += 1
            daily_data[day]['calories_burned'] += workout.total_calories or 0

        trend_data = []
        for day in (start_date + timedelta(n) for n in range(days)):
            data = daily_data.get(day, {'workout_count': 0, 'calories_burned': 0})
            trend_data.append({'date': day, **data})

        return trend_data

    def get_progress_summary(self):
        """
        Summary including:
        - Estimated current weight vs starting weight
        - Total calories consumed, burned, net calories in last 30 days
        - Average daily calories consumed and burned
        """
        days = 30
        start_date = date.today() - timedelta(days=days)

        # Weight progress
        estimated_weight = self.get_estimated_current_weight()

        # Calorie sums in last 30 days
        calorie_stats = self.daily_summaries.filter(date__gte=start_date).aggregate(
            total_consumed=Sum('calories_consumed'),
            total_burned=Sum('calories_burned'),
            total_net=Sum('net_calories'),
            avg_consumed=Avg('calories_consumed'),
            avg_burned=Avg('calories_burned'),
            days_recorded=Count('id'),
        )

        return {
            'starting_weight': self.weight,
            'estimated_current_weight': estimated_weight,
            'weight_goal': self.goal_weight,
            'goal': self.goal,
            'calories_last_30_days': {
                'total_consumed': calorie_stats['total_consumed'] or 0,
                'total_burned': calorie_stats['total_burned'] or 0,
                'total_net': calorie_stats['total_net'] or 0,
                'avg_consumed': calorie_stats['avg_consumed'] or 0,
                'avg_burned': calorie_stats['avg_burned'] or 0,
                'days_recorded': calorie_stats['days_recorded'] or 0,
            }
        }
    
    
    def get_workout_streak(self):
        workouts_dates = self.workouts.order_by('-workout_date').values_list('workout_date', flat=True)
        streak = 0
        current_day = date.today()

        for workout_date in workouts_dates:
            if workout_date == current_day:
                streak += 1
                current_day -= timedelta(days=1)
            elif workout_date < current_day:
                break
        return streak

    def get_avg_workout_duration(self):
        avg_duration = self.workouts.aggregate(avg_time=Avg('total_time'))['avg_time']
        if avg_duration:
            return avg_duration.total_seconds() / 60
        return 0

    def get_workout_stats(self):
        return {
            "workouts_completed": self.workouts.count(),
            "workout_streak": self.get_workout_streak(),
            "avg_workout_duration": round(self.get_avg_workout_duration(), 2),
        }
    
    def get_daily_calorie_goal(self):
        data = self.calculate_calories()
        if self.goal == "Weight Loss":
            return data.get("weight_loss", 1800)
        elif self.goal == "Weight Gain":
            return data.get("weight_gain", 1800)
        return 1800


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
    met = models.FloatField(default=5.0) 

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
        user = self.workout.user
        weight_kg = user.weight
        mins = self.total_time.total_seconds() / 60 if self.total_time else 60

        if not self.exercise or not self.exercise.met or not weight_kg or mins <= 0:
            self.total_calories = 0.0
            self.save(update_fields=['total_calories'])
            return 0.0

        met = self.exercise.met
        calories = met * weight_kg * 0.0175 * mins
        self.total_calories = round(calories, 2)
        self.save(update_fields=['total_calories'])
        return self.total_calories


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
        # 1. Total calories burned from workouts
        burned = Workout.objects.filter(
            user=self.user,
            workout_date=self.date
        ).aggregate(total=Sum('total_calories'))['total'] or 0

        # 2. Total calories consumed from meals marked as consumed
        consumed = MealPlan.objects.filter(
            user=self.user,
            is_consumed=True,
            created_at__date=self.date
        ).aggregate(total=Sum('calories'))['total'] or 0

        self.calories_burned = burned
        self.calories_consumed = consumed

        # 3. Fetch user target calorie goal
        target_data = self.user.calculate_calories(activity_level=self.user.activity_level)
        base_target = target_data.get('weight_loss') or target_data.get('weight_gain') or 0

        # 4. Compute net calories depending on user's goal
        if self.user.goal == 'Weight Gain':
            goal_threshold = base_target + burned
            self.net_calories = consumed - goal_threshold
        elif self.user.goal == 'Weight Loss':
            goal_threshold = base_target - burned
            self.net_calories = goal_threshold - consumed
        else:
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
    
    #  New link to WorkoutExercise
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name='exercise_histories', null=True, blank=True)
    
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

def get_top_meals_with_avg_calories(user, top_n=10):
    # Get aggregated data
    top_meals = (
        MealPlan.objects
        .filter(user=user, is_consumed=True)
        .values('meal', 'name', 'dietary_restriction')
        .annotate(
            times_eaten=Count('id'),
            avg_calories=Avg('calories')
        )
        .order_by('-times_eaten')[:top_n]
    )

    # Fetch matching meals with their ingredients
    enriched_meals = []
    for meal_data in top_meals:
        meal_name = meal_data['name']
        meal_obj = (
            MealPlan.objects
            .filter(user=user, name=meal_name, is_consumed=True)
            .first()
        )
        meal_data['ingredients'] = meal_obj.ingredients if meal_obj else []
        enriched_meals.append(meal_data)

    return enriched_meals

def get_today_summary(user):
    today = date.today()
    summary = DailyCalorieSummary.objects.filter(user=user, date=today).first()

    meals_eaten = MealPlan.objects.filter(user=user, is_consumed=True, created_at__date=today).count()
    workouts_done = Workout.objects.filter(user=user, workout_date=today).count()

    return {
        "calories_consumed": summary.calories_consumed,
        "calories_burned": summary.calories_burned,
        "meals_eaten": meals_eaten,
        "workouts_done": workouts_done,
    }
