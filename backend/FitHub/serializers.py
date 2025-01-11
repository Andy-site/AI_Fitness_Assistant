from rest_framework import serializers
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'age', 'height', 'weight', 'goal']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_age(self, value):
        if not isinstance(value, int):
            raise serializers.ValidationError("Age must be an integer.")
        if value < 0:
            raise serializers.ValidationError("Age cannot be negative.")
        return value

    def validate_height(self, value):
        if not isinstance(value, (float, int)):
            raise serializers.ValidationError("Height must be a valid number.")
        if value <= 0:
            raise serializers.ValidationError("Height must be a positive number.")
        return value

    def validate_weight(self, value):
        if not isinstance(value, (float, int)):
            raise serializers.ValidationError("Weight must be a valid number.")
        if value <= 0:
            raise serializers.ValidationError("Weight must be a positive number.")
        return value

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
