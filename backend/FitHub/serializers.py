
from rest_framework import serializers
from django.core.exceptions import ValidationError
import re
from .models import CustomUser

# Custom Password Regex Validator
def validate_password_strength(value):
    password_regex = r'^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$'
    if not re.match(password_regex, value):
        raise ValidationError(
            "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character."
        )
    return value

class CustomRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password_strength])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'confirm_password', 'name', 'age', 'height', 'weight', 'goal']
    
    def validate(self, attrs):
        # Check if passwords match
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        # Remove the confirm_password from the validated data
        validated_data.pop('confirm_password', None)
        user = CustomUser.objects.create_user(**validated_data)
        return user
