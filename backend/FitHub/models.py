# FitHub/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class FitHubUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    age = models.IntegerField(null=True)
    height = models.FloatField(null=True)  # in cm
    weight = models.FloatField(null=True)  # in kg
    goal = models.CharField(max_length=100, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'fithub_users'