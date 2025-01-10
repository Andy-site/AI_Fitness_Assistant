# FitHub/serializers.py
from rest_framework import serializers
from .models import FitHubUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = FitHubUser
        fields = ['email', 'password', 'first_name', 'last_name', 
                 'age', 'height', 'weight', 'goal']

    def create(self, validated_data):
        user = FitHubUser.objects.create_user(
            username=validated_data['email'],  # Using email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            age=validated_data.get('age'),
            height=validated_data.get('height'),
            weight=validated_data.get('weight'),
            goal=validated_data.get('goal')
        )
        return user