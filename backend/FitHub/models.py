from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False)
    age = models.PositiveIntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    goal = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Define the primary authentication field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Fields required on user creation aside from email

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
