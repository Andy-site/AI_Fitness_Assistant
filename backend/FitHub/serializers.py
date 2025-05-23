from rest_framework import serializers
from .models import CustomUser, PoseEstimationSession, PoseExerciseSet, PoseFeedback, Workout, WorkoutExercise, ExercisePerformance, WorkoutLibrary, WorkoutLibraryExercise, Exercise, FavoriteExercise, MealPlan
import re
from rest_framework import serializers
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'age', 'height', 'weight',  'goal', 'username', 'goal_weight','goal_duration','activity_level']
        extra_kwargs = {'password': {'write_only': True}, 'username': {'required': False}}  # Make username not required

    def validate_username(self, value):
        # If no username is provided, set it to the email
        if not value:
            value = self.initial_data.get('email')
        # Ensure username (email) is unique
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_goal_weight(self, value):
        # Retrieve the current user weight (assuming it is passed as part of the registration data)
        current_weight = self.initial_data.get('weight')
        goal = self.initial_data.get('goal')

        if goal == 'Weight Loss' and value >= current_weight:
            raise serializers.ValidationError("Goal weight must be less than your current weight for weight loss.")
        if goal == 'Weight Gain' and value <= current_weight:
            raise serializers.ValidationError("Goal weight must be greater than your current weight for weight gain.")
        
        return value

    def create(self, validated_data):
        # Set the username to the email if not provided
        if 'username' not in validated_data:
            validated_data['username'] = validated_data['email']
        
        # Create the user with the validated data
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
    def get_calories(self, obj):
        return obj.calculate_calories(activity_level=obj.activity_level)


class UserProfileSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(required=False, allow_null=True)
    estimated_weight = serializers.SerializerMethodField()
    calories = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email', 'first_name', 'last_name', 'age', 'height', 'weight', 'estimated_weight',
            'goal', 'goal_weight', 'profile_photo', 'goal_duration', 'activity_level', 'created_at','calories'
        ]
        read_only_fields = ['id','email']
    
    def get_estimated_weight(self, obj):
        return obj.get_estimated_current_weight()

    def get_calories(self, obj):
        return obj.calculate_calories(activity_level=obj.activity_level)

    def validate(self, data):
        """
        Validate all fields together.
        """
        # Convert numeric fields to proper types
        try:
            if 'age' in data:
                data['age'] = int(data['age'])
            if 'height' in data:
                data['height'] = float(data['height'])
            if 'weight' in data:
                data['weight'] = float(data['weight'])
            if 'goal_weight' in data:
                data['goal_weight'] = float(data['goal_weight'])
        except (TypeError, ValueError):
            raise serializers.ValidationError("Invalid numeric value provided.")

        # Validate goal weight against current weight
        if all(key in data for key in ['goal', 'weight', 'goal_weight']):
            if data['goal'] == 'Weight Loss' and data['goal_weight'] >= data['weight']:
                raise serializers.ValidationError({
                    "goal_weight": "Goal weight must be less than current weight for weight loss."
                })
            if data['goal'] == 'Weight Gain' and data['goal_weight'] <= data['weight']:
                raise serializers.ValidationError({
                    "goal_weight": "Goal weight must be greater than current weight for weight gain."
                })

        return data

    def update(self, instance, validated_data):
        """
        Handle profile update with proper error handling.
        """
        try:
            # Handle profile photo separately
            profile_photo = validated_data.pop('profile_photo', None)
            if profile_photo is not None:
                instance.profile_photo = profile_photo
            
            # Update other fields
            for attr, value in validated_data.items():
                if hasattr(instance, attr):
                    setattr(instance, attr, value)

            instance.save()
            return instance
        except Exception as e:
            raise serializers.ValidationError({
                "message": f"Error updating profile: {str(e)}"
            })

    def to_representation(self, instance):
        """
        Customize the serialized output.
        """
        data = super().to_representation(instance)
        
        # Handle profile photo URL
        if instance.profile_photo:
            if hasattr(instance.profile_photo, 'url'):
                data['profile_photo'] = instance.profile_photo.url
            else:
                data['profile_photo'] = None
        
        # Ensure numeric fields are properly formatted
        data['age'] = int(instance.age) if instance.age else None
        data['height'] = float(instance.height) if instance.height else None
        data['weight'] = float(instance.weight) if instance.weight else None
        data['goal_weight'] = float(instance.goal_weight) if instance.goal_weight else None

        return data
    
   



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

class UserWorkoutStatsSerializer(serializers.ModelSerializer):
    workouts_completed = serializers.SerializerMethodField()
    workout_streak = serializers.SerializerMethodField()
    avg_workout_duration = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['workouts_completed', 'workout_streak', 'avg_workout_duration']

    def get_workouts_completed(self, obj):
        return obj.workouts.count()

    def get_workout_streak(self, obj):
        return obj.get_workout_streak()

    def get_avg_workout_duration(self, obj):
        return round(obj.get_avg_workout_duration(), 2)

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutExercise
        fields = ['id', 'workout', 'exercise_name', 'body_part', 'exercise_date', 'start_time', 'duration']
        read_only_fields = ['id', 'exercise_date', 'start_time']


class ExercisePerformanceSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='workout_exercise.exercise.category', read_only=True)
    exercise_name = serializers.CharField(source='workout_exercise.exercise.name', read_only=True)

    class Meta:
        model = ExercisePerformance
        fields = ['id', 'workout_exercise', 'set_number', 'reps', 'weight', 'category', 'exercise_name']
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

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = ['id', 'user', 'meal', 'name', 'ingredients', 'calories', 'is_consumed', 'created_at', 'dietary_restriction']
        read_only_fields = ['id', 'user', 'created_at']

class PoseEstimationSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoseEstimationSession
        fields = ['id', 'pose_type', 'started_at', 'ended_at', 'completed']
        read_only_fields = ['id', 'started_at', 'ended_at', 'completed']


class PoseFeedbackSerializer(serializers.ModelSerializer):
        class Meta:
            model = PoseFeedback
            fields = '__all__'


class PoseExerciseSetSummarySerializer(serializers.ModelSerializer):
    exercise = serializers.SerializerMethodField()

    class Meta:
        model = PoseExerciseSet
        fields = ['set_number', 'exercise', 'reps', 'duration_seconds', 'calories_burned']

    def get_exercise(self, obj):
        return obj.exercise.name if obj.exercise else obj.session.pose_type
