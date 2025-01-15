from rest_framework import serializers
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'age', 'height', 'weight', 'goal', 'username']
        extra_kwargs = {'password': {'write_only': True}, 'username': {'required': False}}  # Make username not required

    def validate_username(self, value):
        # If no username is provided, set it to the email
        if not value:
            value = self.initial_data.get('email')
        # Ensure username (email) is unique
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        # Set the username to the email if not provided
        if 'username' not in validated_data:
            validated_data['username'] = validated_data['email']
        
        # Create the user with the validated data
        user = CustomUser.objects.create_user(**validated_data)
        return user
