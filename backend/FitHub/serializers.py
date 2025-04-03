from rest_framework import serializers
from .models import CustomUser, Workout, WorkoutExercise, ExercisePerformance, WorkoutLibrary, WorkoutLibraryExercise, Exercise, FavoriteExercise

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

class UserProfileSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(required=False)  # If you want the user to be able to upload an image

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'age', 'height', 'weight', 'goal','profile_photo']
        read_only_fields = ['email']  # Make sure the email is not editable
    
    def update(self, instance, validated_data):
        # Check if profile photo is provided and update
        profile_photo = validated_data.pop('profile_photo', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # If a new profile photo is uploaded, update it
        if profile_photo:
            instance.profile_photo = profile_photo
        
        instance.save()
        return instance


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'  # Expose all fields in the API response

class FavoriteExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteExercise
        fields = ['id', 'user', 'exercise']

class ToggleFavoriteExerciseSerializer(serializers.Serializer):
    exercise_name = serializers.CharField(max_length=255)

class WorkoutSerializer(serializers.ModelSerializer):
    workout_library_name = serializers.CharField(source="workout_library.name", read_only=True)  # Get library name

    class Meta:
        model = Workout
        fields = ['id', 'user', 'workout_date', 'total_time', 'total_calories', 'workout_library', 'workout_library_name']
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
        

class WorkoutLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLibrary
        fields = ['id', 'user', 'name', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class WorkoutLibraryExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLibraryExercise
        fields = ['id', 'library', 'workout_exercise_id', 'name', 'body_part']
        read_only_fields = ['id', 'library']
