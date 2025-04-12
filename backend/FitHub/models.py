import random
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.timezone import now, timedelta
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum

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
    goal = models.CharField(max_length=255)  # e.g., Weight Loss, Weight Gain
    goal_weight = models.FloatField(null=True, blank=True)  # Target weight
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    goal_duration = models.CharField(
        max_length=20,
        choices=[
            ('1 month', '1 month'),
            ('2 months', '2 months'),
            ('3 months', '3 months'),
            ('4 months', '4 months'),
            ('5 months', '5 months'),
            ('6 months', '6 months'),
            ('7 months', '7 months'),
            ('8 months', '8 months'),
            ('9 months', '9 months'),
            ('10 months', '10 months'),
            ('11 months', '11 months'),
            ('12 months', '12 months'),
        ],
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
    activity_level = models.CharField(
        max_length=20,
        choices=ACTIVITY_LEVEL_CHOICES,
        default='moderate',
    )

    def calculate_calories(self, activity_level='moderate'):
        """
        Calculate daily calorie needs for weight loss or weight gain.
        """
        # Calculate BMR using the Mifflin-St Jeor Equation
        if hasattr(self, 'gender') and self.gender == 'male':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        else:
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age - 161

        # Activity level multipliers
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very active': 1.9,
        }

        # Adjust BMR based on activity level
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)

        # Calculate total weight change required (in kg)
        weight_change = abs(self.goal_weight - self.weight) if self.goal_weight else 0

        # Convert goal duration to days
        duration_in_days = int(self.goal_duration.split()[0]) * 30 if self.goal_duration else 90

        # Calculate daily calorie adjustment
        daily_calorie_adjustment = (weight_change * 7700) / duration_in_days

        # Adjust TDEE for weight loss or weight gain
        if self.goal == 'Weight Loss':
            weight_loss_calories = tdee - daily_calorie_adjustment
            return {'weight_loss': round(weight_loss_calories)}
        elif self.goal == 'Weight Gain':
            weight_gain_calories = tdee + daily_calorie_adjustment
            return {'weight_gain': round(weight_gain_calories)}
        else:
            return {}


    

class OTP(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank = True, default=False)
    email_sent = models.BooleanField(default=False)  # Add this field
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Set expiry to 10 minutes from now by default
            self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def generate_otp(self):
        # Generate a 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        self.otp = otp
        self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        # Don't save here - let the calling code decide when to save
        return otp
    
    def is_otp_valid(self, otp):
        return self.otp == otp and timezone.now() <= self.expires_at


    
class WorkoutLibrary(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="workout_libraries")
    name = models.CharField(max_length=255)  # Custom workout name
    created_at = models.DateTimeField(auto_now_add=True)  # When it was created

    def __str__(self):
        return f"{self.name} by {self.user.email}"
    
    
class Workout(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="workouts")
    workout_date = models.DateField(default=now)  # Date when the workout was done
    total_time = models.DurationField(null=True, blank=True)  # Total time spent on workout
    total_calories = models.FloatField(null=True, blank=True)  # Calories burned
    workout_library = models.ForeignKey(WorkoutLibrary, on_delete=models.SET_NULL, null=True, blank=True)  # Optional

    def calculate_total_calories(self):
        """
        Calculate total calories burned for this workout.
        """
        total_calories = 0
        for exercise in self.exercises.all():
            total_calories += exercise.calculate_calories()
        self.total_calories = total_calories
        self.save()
        return total_calories

    def __str__(self):
        return f"Workout for {self.user.email} on {self.workout_date}"

class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises", null=True)
    workout_exercise_id = models.IntegerField(default=1)  # Store API exercise ID
    name = models.CharField(max_length=200)  # Store exercise name for quick reference
    body_part = models.CharField(max_length=100, null=True)  # Store body part info
    start_date = models.DateField(default=now)  # When the exercise started
    total_time = models.DurationField(null=True, blank=True)  # Time taken for this exercise
    total_calories = models.FloatField(null=True, blank=True, default=0.0)  # Calories burned for this exercise

    def calculate_calories(self):
        """
        Calculate calories burned for this exercise based on performance data.
        """
        total_calories = 0
        for performance in self.performance.all():
            # Example formula: calories burned = reps * weight * 0.1
            total_calories += performance.reps * performance.weight * 0.1
        self.total_calories = total_calories
        self.save()
        return total_calories

    def __str__(self):
        return f"{self.name} ({self.body_part})"
    

class ExercisePerformance(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name="performance")
    set_number = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()

    def calculate_calories(self):
        """
        Calculate calories burned for this performance.
        Example formula: calories burned = reps * weight * 0.1
        """
        return self.reps * self.weight * 0.1

    def __str__(self):
        return f"{self.workout_exercise.name} - Set {self.set_number}: {self.reps} reps at {self.weight}kg"


class WorkoutLibraryExercise(models.Model):
    library = models.ForeignKey(WorkoutLibrary, on_delete=models.CASCADE, related_name="exercises")
    workout_exercise_id = models.IntegerField(default=1)  # Store API exercise ID
    name = models.CharField(max_length=200)  # Exercise name
    body_part = models.CharField(max_length=100, null=True)  # Muscle group

    def __str__(self):
        return f"{self.name} in {self.library.name}"


class Exercise(models.Model):
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100, blank=True, null=True)  # e.g., "Strength", "Cardio"
    equipment = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    secondary = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    

class FavoriteExercise(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'exercise') 


class MealPlan(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="meal_plans")
    meal = models.CharField(max_length=100)  # e.g., Breakfast, Lunch, etc.
    name = models.CharField(max_length=255)  # e.g., Oatmeal with Fruits
    ingredients = models.JSONField()  # Store ingredients as a JSON array
    calories = models.IntegerField()  # Calories for the meal
    dietary_restriction = models.CharField(max_length=50, blank= True, null = True)  # e.g., Vegetarian, Vegan
    is_consumed = models.BooleanField(default=False)  # Flag to track consumption
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for creation

    def __str__(self):
        return f"{self.user.username} - {self.meal} - {self.name}"
    

class DailyCalorieSummary(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="daily_summaries")
    date = models.DateField(default=now)
    calories_consumed = models.FloatField(default=0.0)  # Total calories consumed from meals
    calories_burned = models.FloatField(default=0.0)  # Total calories burned from workouts
    net_calories = models.FloatField(default=0.0)  # Net calorie balance (consumed - burned - required)

    def calculate_net_calories(self):
        """
        Calculate the net calorie balance for the day.
        """
        # Calculate calories burned from workouts
        self.calories_burned = Workout.objects.filter(user=self.user, workout_date=self.date).aggregate(
            total=Sum('total_calories')
        )['total'] or 0

        # Calculate calories consumed from meals
        self.calories_consumed = MealPlan.objects.filter(user=self.user, created_at__date=self.date).aggregate(
            total=Sum('calories')
        )['total'] or 0

        # Get daily required calories
        calorie_data = self.user.calculate_calories(activity_level=self.user.activity_level)
        daily_required_calories = (
            calorie_data.get('weight_loss') or calorie_data.get('weight_gain')
        )

        # Calculate net calories
        self.net_calories = self.calories_consumed - self.calories_burned - daily_required_calories
        self.save()

    def __str__(self):
        return f"Calorie Summary for {self.user.email} on {self.date}"