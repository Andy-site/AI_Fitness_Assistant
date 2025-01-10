# FitHub/serializers.py
from rest_framework import serializers
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'age', 'height', 'weight', 'goal']
        extra_kwargs = {'password': {'write_only':True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)      
        return user