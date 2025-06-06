from calendar import monthrange
from time import timezone
from django.forms import model_to_dict
from django.utils.dateparse import parse_date
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import PoseEstimationSessionSerializer, PoseExerciseSetSummarySerializer, PoseFeedbackSerializer, UserRegistrationSerializer, WorkoutLibrarySerializer, WorkoutLibraryExerciseSerializer, UserProfileSerializer, ExerciseSerializer, FavoriteExerciseSerializer, ToggleFavoriteExerciseSerializer, MealPlanSerializer
from .models import CustomUser, PoseEstimationSession, PoseExerciseSet, WorkoutExercise, ExercisePerformance, Workout, OTP, WorkoutLibrary, WorkoutLibraryExercise, Exercise, FavoriteExercise, MealPlan, DailyCalorieSummary, ExerciseHistory, get_top_exercises, get_top_meals_with_avg_calories
import logging
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta, date
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Index
from django.core.paginator import Paginator
from django.db.models import Sum, Count
from collections import defaultdict

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Get the email from the request data
        email = request.data.get('email')

        # Check if the email already exists
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with user registration if the email doesn't exist
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Create inactive user
            user = serializer.save(is_active=False)

            # Create or reset OTP
            otp_instance, _ = OTP.objects.get_or_create(user=user)
            otp = otp_instance.generate_otp()
            otp_instance.save()

            # You can remove or modify this part if you don't want to send the OTP email
            # For now, just return a success message without sending email
            return Response({
                'message': 'Registration successful. OTP generated.',
                'email': user.email,
                'otp': otp  # You can return the OTP here for testing, or remove it if needed
            }, status=status.HTTP_200_OK)

        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class SendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = get_object_or_404(CustomUser, email=email)

        # Get or create the OTP instance
        otp_instance, _ = OTP.objects.get_or_create(user=user)

        # Always generate a new OTP for password reset
        otp = otp_instance.generate_otp()
        otp_instance.save()

        try:
            send_mail(
                'Your OTP Code - Welcome to FitHub!',
                f"""
                Hi there!

                Welcome to FitHub, your ultimate fitness companion. We're thrilled to have you on board!

                Your OTP code is: {otp}

                Remember, this code is valid for only 10 minutes, so act fast!

                Let's achieve your fitness goals together!

                Best regards,
                The FitHub Team
                """,
                settings.EMAIL_HOST_USER,
                [email],
            )
            return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Failed to send OTP email: %s", str(e))
            return Response({'error': 'Failed to send OTP. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        user = get_object_or_404(CustomUser, email=email)
        otp_instance = get_object_or_404(OTP, user=user)

        if otp_instance.is_otp_valid(otp):
            user.is_active = True  # Activate account here
            user.save()
            return Response({'message': 'OTP verified. Registration complete.'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):

        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"detail": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(request, email=email, password=password)
        if user is not None:
            # Create JWT token
            refresh = RefreshToken.for_user(user)
            logger.info(f"Login successful for user: {user.email}")  # Log successful login
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            logger.error(f"Invalid credentials for email: {email}")  # Log invalid credentials
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Extract the refresh token from the request body
            refresh_token = request.data.get('refresh', None)
            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()  # This will mark the token as invalid

            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        try:
            user = CustomUser.objects.get(email=email)
            otp_record, created = OTP.objects.get_or_create(user=user)
            otp = otp_record.generate_otp()


            send_mail(
                'Password Reset OTP',
                f'Your password reset OTP is: {otp}.',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            return Response({
                'message': 'OTP sent successfully',
                'otp': otp,  # Include for debug or testing; remove in prod
                'timestamp': timezone.now()
            })

        except CustomUser.DoesNotExist:
            
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
          
            return Response({'error': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPasswordResetOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = str(request.data.get('otp'))

        try:
            user = CustomUser.objects.get(email=email)
            otp_record = OTP.objects.filter(user=user).order_by('-created_at').first()

            if otp_record and otp_record.is_otp_valid(otp):
                return Response({'detail': 'OTP verified successfully'}, status=status.HTTP_200_OK)
            return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        otp = str(request.data.get('otp'))
        new_password = request.data.get('password')

        if not all([token, otp, new_password]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=token)
            otp_record = OTP.objects.filter(user=user).order_by('-created_at').first()


            if not otp_record or not otp_record.is_otp_valid(otp):
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            otp_record.delete()  # Clean up

            logger.info(f"[Reset] Password reset successful for {user.email}")
            return Response({'message': 'Password reset successful!'})

        except CustomUser.DoesNotExist:
            logger.error(f"[Reset] User not found: {token}")
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"[Reset] Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Retrieve details of the authenticated user."""
        user = request.user  # The authenticated user

        # Serialize the user data with the UserProfileSerializer to include the profile_photo
        serializer = UserProfileSerializer(user)

        return Response(serializer.data)

class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update the profile of the authenticated user."""
        return self._update_profile(request)

    def patch(self, request):
        """Partially update the profile of the authenticated user."""
        return self._update_profile(request)

    def _update_profile(self, request):
        user = request.user  # Get the current authenticated user

        # Debug: Log the incoming request data
        print("Request Data:", request.data)

        # Fetch the user instance to be updated
        try:
            user_instance = CustomUser.objects.get(id=user.id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        # Use the serializer to validate and update user profile data
        serializer = UserProfileSerializer(user_instance, data=request.data, partial=True)  # partial=True allows for partial updates
        if serializer.is_valid():
            # Save the updated user data
            serializer.save()
            return Response(serializer.data, status=200)

        # Debug: Log serializer errors
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=400)

class HomeView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'message': 'Welcome to the Home page!'}, status=status.HTTP_200_OK)


from django.utils.timezone import now, timedelta

class StartExerciseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Start an exercise session and clean up any stale entries."""
        user = request.user
        exercise_data = request.data

        required_fields = ['exercise_name', 'body_part']
        if not all(field in exercise_data for field in required_fields):
            return Response({"error": "Incomplete exercise data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            exercise = Exercise.objects.get(name__iexact=exercise_data['exercise_name'])
        except Exercise.DoesNotExist:
            return Response({"error": "Exercise not found."}, status=status.HTTP_404_NOT_FOUND)

        today = now().date()

        # Remove any unended exercise entries (total_time is null and start_date is not today)
        WorkoutExercise.objects.filter(
            workout__user=user,
            exercise=exercise,
            total_time__isnull=True
        ).exclude(start_date=today).delete()

        # Get or create today's workout
        workout, _ = Workout.objects.get_or_create(
            user=user,
            workout_date=today,
            defaults={'total_time': timedelta(seconds=0), 'total_calories': 0}
        )

        # Create a new workout exercise session
        workout_exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise=exercise,
            start_date=today
        )

        return Response({
            "message": "Exercise started successfully.",
            "workout_exercise_id": workout_exercise.id
        }, status=status.HTTP_201_CREATED)

class CancelExerciseView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, workout_exercise_id):
        """Cancel an exercise session by deleting the entry."""
        user = request.user
        try:
            workout_exercise = WorkoutExercise.objects.get(id=workout_exercise_id, workout__user=user)
            workout_exercise.delete()
            return Response({"message": "Workout exercise cancelled and deleted."}, status=status.HTTP_200_OK)
        except WorkoutExercise.DoesNotExist:
            return Response({"error": "Workout exercise not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

class CalorieGoalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        calorie_goal = user.get_daily_calorie_goal()
        duration_days = int(user.goal_duration.split()[0]) * 30 if user.goal_duration else 90

        return Response({
            "daily_calorie_goal": calorie_goal,
            "goal_duration_days": duration_days,
            "goal_type": user.goal
        })
    
class WorkoutStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = user.get_workout_stats()
        return Response(data)

class ExerciseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user

        # Get all exercise histories for this user, ordered by date
        histories = ExerciseHistory.objects.filter(user=user).select_related(
            'exercise'
        ).order_by('date')

        exercise_data = {}

        for history in histories:
            exercise = history.exercise
            category = exercise.category  # e.g. "Chest", "Back"
            exercise_name = exercise.name

            if category not in exercise_data:
                exercise_data[category] = []

            exercise_data[category].append({
                'exercise': exercise_name,
                'date': history.date.strftime('%Y-%m-%d'),
                'sets': history.sets,
                'reps_per_set': history.reps_per_set,
                'weight_per_set': history.weight_per_set,
                'total_volume': history.total_volume(),
            })

        return Response({
            'exercise_progress': exercise_data
        })


class EndExerciseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """End an exercise session and update duration and total time."""
        workout_exercise_id = int(request.data.get('workout_exercise_id'))  # If it's numeric

        total_time_seconds = request.data.get('total_time_seconds', 0)
        calories_burned = request.data.get('calories_burned', 0)

        workout_exercise = get_object_or_404(WorkoutExercise, id=workout_exercise_id)

        # Update workout exercise duration and calories
        workout_exercise.total_time = timedelta(seconds=total_time_seconds)
        workout_exercise.total_calories += float(calories_burned)
        workout_exercise.save()

        # Update total workout time and calories
        workout = workout_exercise.workout
        workout.total_time += timedelta(seconds=total_time_seconds)
        workout.total_calories += float(calories_burned)
        workout.save()

        return Response({
            "message": "Exercise ended successfully.",
            "total_time_seconds": total_time_seconds,
            "calories_burned": calories_burned
        }, status=status.HTTP_200_OK)


class LogExercisePerformanceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Log performance details for an exercise."""
        workout_exercise_id = int(request.data.get('workout_exercise_id'))  # If it's numeric

        set_data = request.data.get('sets', [])

        workout_exercise = get_object_or_404(WorkoutExercise, id=workout_exercise_id)

        for set_info in set_data:
            ExercisePerformance.objects.create(
                workout_exercise=workout_exercise,
                set_number=set_info.get('set_number'),
                reps=set_info.get('reps'),
                weight=set_info.get('weight')
            )

        return Response({'message': 'Exercise performance logged successfully.'}, status=status.HTTP_201_CREATED)
    
class RecommendExercisesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        raw_recommended = get_top_exercises(user)

        recommended = [
            {
                "id": item["workout_exercise__exercise__id"],
                "name": item["workout_exercise__exercise__name"],
                "category": item["workout_exercise__exercise__category"],
            }
            for item in raw_recommended
        ]

        return Response({"recommended_exercises": recommended}, status=200)
    
class RecommendedMealView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        top_meals = get_top_meals_with_avg_calories(user)
        return Response(top_meals)

class FavoriteExerciseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get all favorite exercises for the authenticated user
        """
        try:
            # Get user's favorite exercises with related exercise data
            favorite_exercises = FavoriteExercise.objects.filter(
                user=request.user
            ).select_related('exercise')
            
            # Format the response data
            result = []
            for fav in favorite_exercises:
                exercise = fav.exercise
                result.append({
                    'favorite_id': fav.id,
                    'exercise_id': exercise.id,
                    'name': exercise.name,
                    'body_part': exercise.category,
                    'created_at': fav.created_at,
                    # Add any other exercise fields you need
                })
                
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """
        Add an exercise to favorites
        """
        exercise_id = request.data.get('exercise_id')
        if not exercise_id:
            return Response(
                {'error': 'Exercise ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            exercise = Exercise.objects.get(id=exercise_id)
            # Create favorite if it doesn't exist
            favorite, created = FavoriteExercise.objects.get_or_create(
                user=request.user,
                exercise=exercise
            )
            
            if created:
                return Response(
                    {'message': 'Exercise added to favorites'},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {'message': 'Exercise already in favorites'},
                    status=status.HTTP_200_OK
                )
        except Exercise.DoesNotExist:
            return Response(
                {'error': 'Exercise not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, favorite_id=None):
        """
        Remove an exercise from favorites
        """
        if not favorite_id:
            # Check if it's in the request data instead
            favorite_id = request.data.get('favorite_id')
            if not favorite_id:
                return Response(
                    {'error': 'Favorite ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Make sure the favorite belongs to the current user
            favorite = FavoriteExercise.objects.get(
                id=favorite_id,
                user=request.user
            )
            favorite.delete()
            return Response(
                {'message': 'Exercise removed from favorites'},
                status=status.HTTP_200_OK
            )
        except FavoriteExercise.DoesNotExist:
            return Response(
                {'error': 'Favorite not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# -------------------------------------------------------------------
# Exercise database Views
# -------------------------------------------------------------------


#  Add Indexing to Speed Up Queries (Only Needs to Be Done Once)
class Meta:
    indexes = [
        Index(fields=['category']),
        Index(fields=['equipment']),
        Index(fields=['name']),  # Sorting Index
    ]

class ExerciseListPagination(PageNumberPagination):
    page_size = 2000  # Default limit to 20 exercises per request
    page_size_query_param = 'limit'
    max_page_size = 2000  # Prevent excessive data retrieval

class ExerciseListView(ListAPIView):
    """
    API endpoint to list exercises filtered by both category and equipment
    """
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]
    pagination_class = ExerciseListPagination  # Enable pagination

    def get_queryset(self):
        queryset = Exercise.objects.all()

        category = self.request.query_params.get('category', None)
        equipment = self.request.query_params.get('equipment', None)
        search_query = self.request.query_params.get('search', None)

        # Apply indexed filters
        if category:
            queryset = queryset.filter(category=category)  # Uses idx_category
        if equipment:
            queryset = queryset.filter(equipment=equipment)  # Uses idx_equipment
        if search_query:
            queryset = queryset.filter(name__istartswith=search_query)  # <-- NEW


        return queryset.order_by('name')  # Uses idx_name for optimized sorting


#  Optimized Query for Equipment-Based Exercise List
class ExercisesByEquipmentList(ListAPIView):
    """
    API endpoint to list exercises by equipment
    """
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Exercise.objects.filter(
            equipment=self.kwargs['equipment']
        ).only("id", "name", "category", "equipment").order_by('name')[:20]


#  Optimized Query for Category-Based Exercise List
class ExercisesByCategoryList(ListAPIView):
    """
    API endpoint to list exercises by category
    """
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Exercise.objects.filter(
            category=self.kwargs['category']
        ).only("id", "name", "category", "equipment").order_by('name')[:20]


#  Optimized Category List API
class ExerciseCategoriesView(APIView):
    """
    API endpoint to list all unique exercise categories
    """
    def get(self, request):
        categories = Exercise.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))  # Return plain list instead of loop


#  Optimized Equipment List API
class ExerciseEquipmentView(APIView):
    """
    API endpoint to list all unique exercise equipment
    """
    def get(self, request):
        equipment = Exercise.objects.values_list('equipment', flat=True).distinct()
        return Response(list(equipment))  # Return plain list instead of loop


class CalorieProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        today = timezone.now().date()
        summaries = DailyCalorieSummary.objects.filter(
            user=user,
            date__range=[today - timedelta(days=6), today]
        ).order_by('date')

        data = []
        for summary in summaries:
            data.append({
                'date': summary.date.strftime('%Y-%m-%d'),
                'calories_consumed': summary.calories_consumed,
                'calories_burned': summary.calories_burned,
                'net_calories': summary.net_calories,
            })

        return Response({
            'goal': user.goal,
            'data': data,
        })

class ToggleFavoriteExercise(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add or remove exercise from favorites."""
        user = request.user
        serializer = ToggleFavoriteExerciseSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        exercise_name = serializer.validated_data['exercise_name']
        action = request.query_params.get('action', 'toggle')  # Default to 'toggle'

        # Try to find the exercise by name (case insensitive)
        try:
            exercise = Exercise.objects.get(name__iexact=exercise_name)
        except Exercise.DoesNotExist:
            return Response({"error": "Exercise not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == 'check':
            # Check if the exercise is already in the user's favorite list
            is_favorite = FavoriteExercise.objects.filter(user=user, exercise=exercise).exists()
            return Response({"is_favorite": is_favorite}, status=status.HTTP_200_OK)
        elif action == 'toggle':
            # Check if the exercise is already in the user's favorite list
            favorite, created = FavoriteExercise.objects.get_or_create(user=user, exercise=exercise)

            if created:
                # If the exercise was not in the favorites, add it
                favorite_serializer = FavoriteExerciseSerializer(favorite)
                return Response({
                    "message": f"{exercise_name} added to favorites",
                    "favorite": favorite_serializer.data,
                }, status=status.HTTP_201_CREATED)
            else:
                # If the exercise is already in favorites, remove it
                favorite.delete()
                return Response({
                    "message": f"{exercise_name} removed from favorites",
                }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

# -------------------------------------------------------------------
# WorkoutLibrary Views
# -------------------------------------------------------------------

class WorkoutLibraryCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Create a new workout library for the authenticated user.
        
        Expected payload:
        {
            "name": "My Library Name"
        }
        """
        user = request.user
        data = request.data

        if 'name' not in data:
            return Response({"error": "Library name is required."}, status=status.HTTP_400_BAD_REQUEST)

        library = WorkoutLibrary.objects.create(
            user=user,
            name=data['name']
        )

        serializer = WorkoutLibrarySerializer(library)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WorkoutLibraryListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        List all workout libraries that belong to the authenticated user.
        """
        libraries = WorkoutLibrary.objects.filter(user=request.user)
        serializer = WorkoutLibrarySerializer(libraries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkoutLibraryDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, library_id):
        """
        Delete a workout library for the authenticated user.
        
        URL should include the 'library_id'.
        """
        try:
            library = WorkoutLibrary.objects.get(id=library_id, user=request.user)
        except WorkoutLibrary.DoesNotExist:
            return Response({"error": "Workout library not found."}, status=status.HTTP_404_NOT_FOUND)
        
        library.delete()
        return Response({"message": "Workout library deleted successfully."}, status=status.HTTP_200_OK)


# -------------------------------------------------------------------
# WorkoutLibraryExercise Views
# -------------------------------------------------------------------

class WorkoutLibraryExerciseAddView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, library_id):
        """
        Add a new exercise to a specific workout library.
        
        URL should include the 'library_id'.
        
        Expected payload:
        {
            "workout_exercise_id": 456,
            "name": "Squats",
            "body_part": "Legs"
        }
        """
        user = request.user
        data = request.data

        # Ensure required fields are provided
        required_fields = ['workout_exercise_id', 'name', 'body_part']
        if not all(field in data for field in required_fields):
            return Response({"error": "Incomplete exercise data."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the library exists and belongs to the user
        try:
            library = WorkoutLibrary.objects.get(id=library_id, user=user)
        except WorkoutLibrary.DoesNotExist:
            return Response({"error": "Workout library not found."}, status=status.HTTP_404_NOT_FOUND)

        # Create the new exercise entry in the library
        exercise = WorkoutLibraryExercise.objects.create(
            library=library,
            workout_exercise_id=data['workout_exercise_id'],
            name=data['name'],
            body_part=data['body_part']
        )

        serializer = WorkoutLibraryExerciseSerializer(exercise)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WorkoutLibraryExerciseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, library_id):
        """
        List all exercises within a specific workout library.
        
        URL should include the 'library_id'.
        """
        try:
            library = WorkoutLibrary.objects.get(id=library_id, user=request.user)
        except WorkoutLibrary.DoesNotExist:
            return Response({"error": "Workout library not found."}, status=status.HTTP_404_NOT_FOUND)

        exercises = library.exercises.all()  # using the related_name "exercises"
        serializer = WorkoutLibraryExerciseSerializer(exercises, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkoutLibraryExerciseDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, library_id, exercise_id):
        """
        Delete an exercise from a workout library for the authenticated user.
        
        URL should include both 'library_id' and 'exercise_id'.
        """
        try:
            library = WorkoutLibrary.objects.get(id=library_id, user=request.user)
        except WorkoutLibrary.DoesNotExist:
            return Response({"error": "Workout library not found."}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            exercise = WorkoutLibraryExercise.objects.get(id=exercise_id, library=library)
        except WorkoutLibraryExercise.DoesNotExist:
            return Response({"error": "Exercise not found in this library."}, status=status.HTTP_404_NOT_FOUND)
        
        exercise.delete()
        return Response({"message": "Exercise deleted successfully."}, status=status.HTTP_200_OK)
    
class MealPlanCreateView(APIView):
    def post(self, request):
        user = request.user
        data = request.data

        # Loop through the meal plan data and create entries
        for meal in data.get('mealPlan', []):
            # Check if the meal already exists for the user with the same ingredients and today's date
            existing_meal = MealPlan.objects.filter(
                user=user,
                meal=meal.get('meal'),
                name=meal.get('name'),
                ingredients=meal.get('ingredients'),
                created_at__date=now().date()  # Check for the same date
            ).first()

            if existing_meal:
                # Skip creating duplicate meal for today
                continue

            # Create the meal if it doesn't exist or the created_at date is different
            MealPlan.objects.create(
                user=user,
                meal=meal.get('meal'),
                name=meal.get('name'),
                ingredients=meal.get('ingredients'),
                dietary_restriction=meal.get('dietary_restriction'),
                calories=meal.get('calories'),
                is_consumed=False,  # Default to False
                created_at=now()  # Explicitly set the created_at date to today
            )

        return Response({"message": "Meal plan created successfully."}, status=status.HTTP_201_CREATED)

class BulkUpdateMealConsumedStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        """
        Bulk update the is_consumed status of multiple meals.
        """
        user = request.user
        updates = request.data.get('updates', [])

        if not updates:
            return Response({"error": "No updates provided."}, status=status.HTTP_400_BAD_REQUEST)

        for update in updates:
            meal_id = update.get('id')
            is_consumed = update.get('is_consumed')

            if meal_id is None or is_consumed is None:
                continue

            try:
                meal = MealPlan.objects.get(id=meal_id, user=user)
                meal.is_consumed = is_consumed
                meal.save()
            except MealPlan.DoesNotExist:
                continue

        return Response({"message": "Meal statuses updated successfully."}, status=status.HTTP_200_OK)
    


class MealPlanListView(APIView):
    def get(self, request):
        user = request.user
        start_date = request.query_params.get('start_date')  # Get start_date from query params

        # Filter meal plans by user and optionally by start_date
        meal_plans = MealPlan.objects.filter(user=user)
        if start_date:
            meal_plans = meal_plans.filter(created_at__date__gte=start_date)

        serializer = MealPlanSerializer(meal_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class BackendMealsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Fetch all meals for the authenticated user for a specific date.
        """
        user = request.user
        start_date = request.query_params.get('start_date')  # e.g., '2025-04-21'

        if start_date:
            meals = MealPlan.objects.filter(user=user, created_at__date=start_date)
        else:
            meals = MealPlan.objects.filter(user=user)

        # Return all needed fields
        data = meals.values('id', 'meal', 'name', 'ingredients', 'calories', 'is_consumed', 'created_at')
        return Response(list(data), status=status.HTTP_200_OK)


class UpdateMealConsumedStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, meal_id):
        """
        Update the is_consumed status of a meal for today's date.
        """
        try:
            # Get today's date
            today = now().date()

            # Fetch the meal for the authenticated user and ensure it matches today's date
            meal = MealPlan.objects.get(id=meal_id, user=request.user, created_at__date=today)

            # Get the is_consumed value from the request
            is_consumed = request.data.get('is_consumed', None)

            if is_consumed is None:
                return Response({"error": "is_consumed field is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Update the is_consumed status
            meal.is_consumed = is_consumed
            meal.save()

            return Response({"message": "Meal status updated successfully.", "is_consumed": meal.is_consumed}, status=status.HTTP_200_OK)
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal not found or does not match today's date."}, status=status.HTTP_404_NOT_FOUND)
        

class MealPlanStatsView(APIView):
    def get(self, request):
        user = request.user

        # Aggregate meals by dietary restriction
        dietary_stats = (
            MealPlan.objects.filter(user=user)
            .values('dietary_restriction')
            .annotate(total=Count('dietary_restriction'))
            .order_by('-total')
        )

        # Aggregate meals by consumption status
        consumption_stats = (
            MealPlan.objects.filter(user=user)
            .values('is_consumed')
            .annotate(total=Count('is_consumed'))
        )

        return Response(
            {
                "dietary_stats": dietary_stats,
                "consumption_stats": consumption_stats,
            },
            status=status.HTTP_200_OK,
        )
    
class MealPlanRangeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response(
                {"error": "start_date and end_date query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        meals = MealPlan.objects.filter(
            user=request.user,
            created_at__date__range=(start_date, end_date)
        ).order_by('created_at')

        serializer = MealPlanSerializer(meals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DailyCalorieSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get the daily calorie summary for the authenticated user.
        """
        user = request.user
        today = now().date()

        # Step 1: Calculate calories consumed from meals
        calories_consumed = MealPlan.objects.filter(user=user, created_at__date=today).aggregate(
            total=Sum('calories')
        )['total'] or 0

        # Step 2: Calculate calories burned from workouts
        calories_burned = Workout.objects.filter(user=user, workout_date=today).aggregate(
            total=Sum('total_calories')
        )['total'] or 0

        # Step 3: Get daily calorie requirements
        calorie_data = user.calculate_calories(activity_level=user.activity_level)
        daily_required_calories = (
            calorie_data.get('weight_loss') or calorie_data.get('weight_gain')
        )

        # Step 4: Calculate net calories
        net_calories = calories_consumed - calories_burned - daily_required_calories

        # Step 5: Save or update the daily summary
        summary, created = DailyCalorieSummary.objects.get_or_create(user=user, date=today)
        summary.calories_consumed = calories_consumed
        summary.calories_burned = calories_burned
        summary.net_calories = net_calories
        summary.save()

        # Step 6: Return the summary
        return Response({
            "date": today,
            "calories_consumed": calories_consumed,
            "calories_burned": calories_burned,
            "daily_required_calories": daily_required_calories,
            "net_calories": net_calories,
        }, status=200)
    

class WorkoutDatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Fetch all workout start dates for the authenticated user.
        """
        workout_dates = WorkoutExercise.objects.filter(workout__user=request.user).values_list('start_date', flat=True)
        return Response(workout_dates)

class CalorieGoalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get the calorie goal for the authenticated user.
        """
        user = request.user

        # Calculate calorie goals using the user's method
        calorie_data = user.calculate_calories(activity_level=user.activity_level)

        if not calorie_data:
            return Response({"error": "Unable to calculate calorie goals."}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare the response data
        response_data = {
            "weight_loss_calories": calorie_data.get('weight_loss'),
            "weight_gain_calories": calorie_data.get('weight_gain'),
            "goal_duration_days": int(user.goal_duration.split()[0]) * 30 if user.goal_duration else 90,  # Convert goal duration to days
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
class ProgressVisualizationAPIView(APIView):
    """
    Returns aggregated data for workouts and meals over different periods:
    - week: last 7 days
    - month: whole selected month (or specific week if week param is provided)
    - 3months: last 90 days
    """

    def get(self, request, *args, **kwargs):
        user = request.user
        period = request.query_params.get('period', 'week')
        date_str = request.query_params.get('date')  # expected format: YYYY-MM-DD
        selected_week = request.query_params.get('week')  # optional: 1-4

        today = date.today()

        if period == 'month' and date_str:
            try:
                month_start = datetime.strptime(date_str, "%Y-%m-%d").date()
                year = month_start.year
                month = month_start.month
                days_in_month = monthrange(year, month)[1]
                full_month_end = date(year, month, days_in_month)

                # Handle optional week filtering
                if selected_week and selected_week.isdigit():
                    week = int(selected_week)
                    if 1 <= week <= 4:
                        start_day = (week - 1) * 7 + 1
                        end_day = min(week * 7, days_in_month)
                        start_date = date(year, month, start_day)
                        end_date = date(year, month, end_day)
                    else:
                        start_date = month_start
                        end_date = full_month_end
                else:
                    # All weeks of the month
                    start_date = month_start
                    end_date = full_month_end

            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        elif period == '3months':
            start_date = today - timedelta(days=90)
            end_date = today

        elif period == 'week':
            start_date = today - timedelta(days=7)
            end_date = today

        else:
            start_date = today - timedelta(days=7)
            end_date = today

        # --- Aggregate Workout Data ---
        workouts = Workout.objects.filter(user=user, workout_date__range=[start_date, end_date])
        workout_data = defaultdict(lambda: {'calories_burned': 0, 'workout_count': 0})

        for w in workouts:
            workout_data[w.workout_date]['calories_burned'] += w.total_calories or 0
            workout_data[w.workout_date]['workout_count'] += 1

        # --- Aggregate Meal Data ---
        meals = MealPlan.objects.filter(user=user, is_consumed=True, created_at__date__range=[start_date, end_date])
        meal_data = defaultdict(int)
        for m in meals:
            meal_date = m.created_at.date()
            meal_data[meal_date] += m.calories

        # --- Compile Daily Results ---
        num_days = (end_date - start_date).days + 1
        results = []
        for i in range(num_days):
            day = start_date + timedelta(days=i)
            results.append({
                'date': day.isoformat(),
                'workout_calories_burned': workout_data[day]['calories_burned'],
                'workout_count': workout_data[day]['workout_count'],
                'meal_calories_consumed': meal_data[day],
            })

        total_workout_calories = sum(item['workout_calories_burned'] for item in results)
        total_meal_calories = sum(item['meal_calories_consumed'] for item in results)

        return Response({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'daily_data': results,
            'summary': {
                'total_workout_calories': total_workout_calories,
                'total_meal_calories': total_meal_calories,
            }
        })

class DailySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        # Get meals eaten
        meals_eaten = MealPlan.objects.filter(user=user, is_consumed=True, created_at__date=today).count()

        # Fetch all workout IDs for the user today
        workout_ids = Workout.objects.filter(user=user, workout_date=today).values_list('id', flat=True)

        workouts_done = WorkoutExercise.objects.filter(
            workout_id__in=workout_ids,
            total_time__isnull=False
        ).count()

        return Response({
            "meals_eaten": meals_eaten,
            "workouts_done": workouts_done,
        })

class PoseEstimationSessionCreateView(APIView):
    def post(self, request):
        serializer = PoseEstimationSessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PoseFeedbackCreateView(APIView):
    def post(self, request):
        serializer = PoseFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PoseEstimationSessionCompleteView(APIView):
    def post(self, request, session_id):
        session = get_object_or_404(PoseEstimationSession, id=session_id, user=request.user)
        session.completed = True
        session.ended_at = timezone.now()
        session.save()
        return Response({"message": "Session marked as completed."}, status=status.HTTP_200_OK)


class MealHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        meals = (
            MealPlan.objects
            .filter(user=user, is_consumed=True)
            .order_by('-created_at')
        )

        meals_data = [
            {
                **model_to_dict(meal),
                'created_at': meal.created_at.isoformat(), 
                'ingredients': meal.ingredients 
            }
            for meal in meals
        ]

        return Response({'meals': meals_data}, status=200)


class DailyFitnessSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        start_date_str = request.query_params.get('start')
        end_date_str = request.query_params.get('end')
        single_date_str = request.query_params.get('date')

        try:
            if start_date_str and end_date_str:
                start_date = date.fromisoformat(start_date_str)
                end_date = date.fromisoformat(end_date_str)
                if start_date > end_date:
                    return Response({'error': 'start date must be before end date'}, status=400)
                date_range = sorted(
    [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)],
    reverse=True
)

            elif single_date_str:
                date_range = [date.fromisoformat(single_date_str)]
            else:
               
                earliest_pose_date = PoseExerciseSet.objects.filter(user=user).order_by('date').values_list('date', flat=True).first()
                earliest_workout_date = Workout.objects.filter(user=user).order_by('workout_date').values_list('workout_date', flat=True).first()
                earliest_meal_date = MealPlan.objects.filter(user=user).order_by('created_at').values_list('created_at', flat=True).first()

                all_dates = [d for d in [earliest_pose_date, earliest_workout_date, earliest_meal_date] if d]
                if not all_dates:
                    return Response([])  # No history available

                start_date = min(d.date() if hasattr(d, 'date') else d for d in all_dates)
                end_date = date.today()

                date_range = sorted(
    [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)],
    reverse=True
)

        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        summary_list = []

        for target_date in date_range:
            pose_sets = PoseExerciseSet.objects.filter(user=user, date=target_date)
            pose_burned = PoseExerciseSet.get_daily_calories(user, target_date)

            workout_burned = Workout.objects.filter(
                user=user, workout_date=target_date
            ).aggregate(total=Sum('total_calories'))['total'] or 0

            consumed = MealPlan.objects.filter(
                user=user, is_consumed=True, created_at__date=target_date
            ).aggregate(total=Sum('calories'))['total'] or 0

            serializer = PoseExerciseSetSummarySerializer(pose_sets, many=True)

            summary_list.append({
                "date": target_date,
                "calories_burned": round(pose_burned + workout_burned, 2),
                "calories_consumed": consumed,
                "net_calories": round(consumed - (pose_burned + workout_burned), 2),
                "pose_sets": serializer.data
            })

        return Response(summary_list)


class CaloriesByPoseView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        if not start_date or not end_date:
            return JsonResponse({"error": "start_date and end_date are required"}, status=400)

        try:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)
            if not start_date or not end_date:
                raise ValueError
        except ValueError:
            return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        # Filter pose exercise sets by user and date range
        queryset = PoseExerciseSet.objects.filter(
            user=user,
            date__range=(start_date, end_date)
        ).select_related('session')

        # Aggregate calories burned per pose_type per date
        data = {}
        for set_obj in queryset:
            key = (set_obj.session.pose_type, set_obj.date.isoformat())
            data[key] = data.get(key, 0) + set_obj.calories_burned

        # Format response as a list of objects
        response_data = [
            {"pose_type": pose, "date": date, "calories_burned": round(cal, 2)}
            for (pose, date), cal in sorted(data.items())
        ]

        return JsonResponse({"data": response_data})