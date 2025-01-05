from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator

# Defining choices for the 'goal' field
GOAL_CHOICES = [
    ('weight_loss', 'Weight Loss'),
    ('weight_gain', 'Weight Gain'),
]


class CustomUser(AbstractUser):
    # Custom fields
    name = models.CharField(max_length=255, unique=True, null=True, blank=True)  # Optional custom name field
    age = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    
    # Goal field with choices
    goal = models.CharField(max_length=50, choices=GOAL_CHOICES, null=True, blank=True)
    
    # Email field with default email validator
    email = models.EmailField(unique=True, validators=[EmailValidator()])

    def __str__(self):
        return self.email
