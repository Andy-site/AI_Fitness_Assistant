from rest_framework import serializers
from .models import CustomUser, Workout, WorkoutExercise, ExercisePerformance, Exercise

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



class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'user', 'workout_date', 'total_time', 'total_calories', 'custom_workout_name']
        read_only_fields = ['id', 'workout_date']


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutExercise
        fields = ['id', 'workout', 'exercise_name', 'body_part', 'exercise_date', 'start_time', 'duration']
        read_only_fields = ['id', 'exercise_date', 'start_time']


class ExercisePerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExercisePerformance
        fields = ['id', 'workout_exercise', 'set_number', 'reps', 'weight']
        read_only_fields = ['id']




class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'force', 'level', 'mechanic', 'equipment',
            'category', 'primary_muscles', 'secondary_muscles', 
            'instructions', 'images'
        ]
