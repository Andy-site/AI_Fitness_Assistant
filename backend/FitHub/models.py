from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from rest_framework import serializers
from .models import CustomUser 

# Password regex validator
password_validator = RegexValidator(
    regex=r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
    message="Password must contain at least one uppercase letter, one number, and one special character."
)

# Goal options
GOAL_CHOICES = [
    ('weight_loss', 'Weight Loss'),
    ('weight_gain', 'Weight Gain')
]

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[password_validator])
    goal = serializers.ChoiceField(choices=GOAL_CHOICES, required=False)

    def validate_age(self, value):
        if value is not None and value < 15:
            raise ValidationError("Age must be greater than 15.")
        return value

    class Meta:
        model = CustomUser
        fields = ['userid', 'name', 'email', 'password', 'age', 'height', 'weight', 'goal', 'createdat']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            age=validated_data.get('age'),
            height=validated_data.get('height'),
            weight=validated_data.get('weight'),
            goal=validated_data.get('goal')
        )
        return user
