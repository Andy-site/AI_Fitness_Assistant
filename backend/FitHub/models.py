import random
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.timezone import now, timedelta
from datetime import timedelta
from django.utils import timezone

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
    goal = models.CharField(max_length=255)
    goal_weight = models.FloatField(null=True, blank=True)  # Add goal weight
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
    )  # Dropdown for goal duration as a string
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
    
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()


    def calculate_calories(self, activity_level='moderate'):
        """
        Calculate daily calorie needs for maintenance, weight loss, and weight gain.
        Incorporates goal duration to adjust calorie deficit or surplus.
        :param activity_level: Activity level ('sedentary', 'light', 'moderate', 'active', 'very active')
        :return: A dictionary with calories for maintenance, weight loss, and weight gain
        """
        # Calculate BMR using the Mifflin-St Jeor Equation
        if hasattr(self, 'gender') and self.gender == 'male':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        else:  # Default to female if gender is not specified
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
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)  # Default to 'moderate'

        # Calculate total weight change required (in kg)
        if self.goal_weight:
            weight_change = abs(self.goal_weight - self.weight)  # Weight to lose or gain
        else:
            weight_change = 0

        # Convert goal duration to days
        if self.goal_duration:
            duration_in_months = int(self.goal_duration.split()[0])  # Extract the number of months
            duration_in_days = duration_in_months * 30  # Approximate each month as 30 days
        else:
            duration_in_days = 90  # Default to 3 months if no duration is provided

        # Calculate daily calorie adjustment based on weight change and duration
        # 1 kg of body weight = ~7700 calories
        daily_calorie_adjustment = (weight_change * 7700) / duration_in_days

        # Adjust TDEE for weight loss or weight gain
        if self.goal == 'Weight Loss':
            weight_loss_calories = tdee - daily_calorie_adjustment
        elif self.goal == 'Weight Gain':
            weight_gain_calories = tdee + daily_calorie_adjustment
        else:
            weight_loss_calories = tdee  # No adjustment for maintenance
            weight_gain_calories = tdee  # No adjustment for maintenance

        # Return calculated calories
        calories = {
            
            'weight_loss': round(weight_loss_calories) if self.goal == 'Weight Loss' else None,
            'weight_gain': round(weight_gain_calories) if self.goal == 'Weight Gain' else None,
        }

        return calories

    

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

    def __str__(self):
        return f"Workout for {self.user.email} on {self.workout_date}"

class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises", null = True)
    workout_exercise_id = models.IntegerField(default = 1)  # Store API exercise ID
    name = models.CharField(max_length=200)  # Store exercise name for quick reference
    body_part = models.CharField(max_length=100, null=True)  # Store body part info
    start_date = models.DateField(default=now)  # When the exercise started
    total_time = models.DurationField(null=True, blank=True)  # Time taken for this exercise
    total_calories = models.FloatField(null=True, blank=True, default=0.0)  # Calories burned for this exercise

    def __str__(self):
        return f"{self.name} ({self.body_part})"

class ExercisePerformance(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name="performance")
    set_number = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()

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