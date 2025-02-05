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

# models.py
# models.py
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    goal = models.CharField(max_length=255)
    reset_otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    otp_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def activate_user(self):
        self.is_active = True
        self.save()

    def reset_password(self, new_password):
        """Reset the user's password."""
        self.set_password(new_password)
        self.save()

    


class OTP(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)

    def generate_otp(self):
        """Generate a new OTP and save it to the OTP model"""
        otp = random.randint(100000, 999999)
        self.otp = str(otp)
        self.created_at = timezone.now()
        self.save()
        return self.otp

    def is_otp_valid(self, otp):
        """Check if the given OTP is valid and not expired (2 minutes validity)"""
        if not self.otp or not self.created_at:
            return False
        
        # Check if OTP matches and is not expired (2 minutes validity)
        is_match = self.otp == otp
        is_expired = self.created_at + timedelta(minutes=2) < timezone.now()

        return is_match and not is_expired

    def verify_otp(self, otp):
        """Verify the OTP and activate the user if valid"""
        if self.is_otp_valid(otp):
            self.user.otp_verified = True
            self.user.activate_user()  # Activate user after OTP verification
            return True
        return False

    
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