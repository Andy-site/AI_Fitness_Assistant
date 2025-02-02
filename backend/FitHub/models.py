import random
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.timezone import now, timedelta
from datetime import timedelta
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with the given email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)

        # Creating the user without a username field
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Ensure password is hashed
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    goal = models.CharField(max_length=255)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    objects = CustomUserManager()

    """Generate a 6-digit OTP and set its timestamp."""
    def generate_otp(self):
        self.otp = f"{random.randint(100000, 999999)}"
        self.otp_created_at = now()
        print(f"Generated new OTP: {self.otp} at {self.otp_created_at}")
        self.save()


    """Validate the OTP and check its expiration (2-minute window)."""
    def is_otp_valid(self, otp):
                
        if self.otp_created_at :
            print("OTP creation time is None")
            return False
                
        time_valid = self.otp_created_at + timedelta(minutes=2) > now()
        print(f"Time valid: {time_valid}")
        
        otp_match = str(self.otp) == str(otp)
        print(f"OTP match: {otp_match}")
        
        return otp_match and time_valid


class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    timestamp = models.DateTimeField(default=timezone.now)  # Store the timestamp of OTP generation

    def __str__(self):
        return f"OTP for {self.email}"
    
class Workout(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    workout_date = models.DateField(default=now)  # Date when the workout was done
    total_time = models.DurationField(null=True, blank=True)  # Total time spent on workout
    total_calories = models.FloatField(null=True, blank=True)  # Calories burned
    custom_workout_name = models.CharField(max_length=255, null=True, blank=True)  # For future custom workouts

    def __str__(self):
        return f"Workout for {self.user.email} on {self.workout_date}"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    exercise_name = models.CharField(max_length=255)  # Exercise name from API
    body_part = models.CharField(max_length=100)  # Body part of the exercise
    exercise_date = models.DateField(default=now)  # **Exact date when the exercise was performed**
    start_time = models.DateTimeField(default=now)  # When the user starts the exercise
    duration = models.DurationField(null=True, blank=True)  # Exercise time duration

    def __str__(self):
        return f"{self.exercise_name} on {self.exercise_date} for {self.workout}"


class ExercisePerformance(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name="sets")
    set_number = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()
    
    def __str__(self):
        return f"Set {self.set_number}: {self.reps} reps @ {self.weight}kg on {self.workout_exercise.exercise_date}"