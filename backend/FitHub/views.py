from time import timezone
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import UserRegistrationSerializer, WorkoutLibrarySerializer, WorkoutLibraryExerciseSerializer, UserProfileSerializer, ExerciseSerializer, FavoriteExerciseSerializer, ToggleFavoriteExerciseSerializer, OTPVerificationSerializer, ResendOTPSerializer
from .models import CustomUser, WorkoutExercise, ExercisePerformance, Workout, OTP, WorkoutLibrary, WorkoutLibraryExercise, Exercise, FavoriteExercise
import logging
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Index
from django.utils import timezone
import json
import random
from django.contrib.auth import get_user_model
from django.core.cache import cache
import uuid 



logger = logging.getLogger(__name__)


User = get_user_model()

import uuid  # Import for generating unique session IDs

class RegisterView(APIView):
    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"error": "Session ID is required."}, status=400)

        cache_key = f"{session_id}"
        cached_data = cache.get(cache_key)
        if not cached_data:
            return Response({"error": "Session expired or invalid."}, status=400)

        cached_data = json.loads(cached_data)
        email = cached_data["email"]

        serializer = UserRegistrationSerializer(data={**request.data, "email": email})
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(serializer.validated_data["password"])
            user.otp_verified = True
            user.save()

            cache.delete(cache_key)

            return Response({"message": "User registered successfully.", "email": user.email}, status=201)

        return Response(serializer.errors, status=400)


class ResendOTPView(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            # Check if there is existing registration data in cache
            cache_key = f"registration_{email}"
            stored_data_json = cache.get(cache_key)

            # Debugging log
            print(f"Cache retrieval for {email}: {stored_data_json}")

            if not stored_data_json:
                return Response({
                    'error': 'Registration session expired or not found. Please register again.'
                }, status=status.HTTP_400_BAD_REQUEST)

            stored_data = json.loads(stored_data_json)
            user_data = stored_data.get('user_data')

            # Generate new OTP
            otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

            # Update registration data with new OTP
            new_registration_data = {
                'user_data': user_data,
                'otp': otp,
                'created_at': timezone.now().isoformat()
            }

            # Debugging log for cache set
            print(f"Setting new OTP in cache for {email}: {new_registration_data}")
            cache.set(cache_key, json.dumps(new_registration_data), timeout=600)

            # Send new OTP via email
            send_mail(
                'Verify your email address',
                f'Your new verification code is: {otp}. This code will expire in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({
                'message': 'New verification code sent to your email.',
                'email': email
            }, status=status.HTTP_200_OK)
        cache_key = f"registration_{serializer.validated_data['session_id']}"
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email is already registered."}, status=status.HTTP_400_BAD_REQUEST)

        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        session_id = str(uuid.uuid4())
        cache_key = f"{session_id}"  # Ensure consistent cache key
        print(f"Session ID during OTP sending: {session_id}")
        print(f"Storing OTP in cache for session_id={session_id}: {otp}")

        cache.set(cache_key, json.dumps({
            'email': email,
            'otp': otp,
            'created_at': timezone.now().isoformat()
        }), timeout=600)
        print(f"Stored OTP in cache for session_id={session_id}: {otp}")

        try:
            send_mail(
                "Your OTP Code",
                f"Your verification code is: {otp}. This code expires in 10 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False
            )
        except Exception as e:
            print("Email error:", e)
            return Response({"error": "Failed to send OTP."}, status=500)

        return Response({
            "message": "OTP sent successfully.",
            "session_id": session_id,
            "email": email
        })

class VerifyOTPView(APIView):
    def post(self, request):
        session_id = request.data.get("sessionId")
        otp = request.data.get("otp")

        if not session_id or not otp:
            return Response({"error": "session_id and otp are required."}, status=400)

        # Log the session_id and OTP received
        print(f"Verifying OTP: session_id={session_id}, otp={otp}")

        cache_key = f"{session_id}"  # Make the cache key consistent
        data = cache.get(cache_key)
        print(f"Retrieving session data from cache: {cache_key}")
        
        if not data:
            print(f"No data found for session_id={session_id}")
            return Response({"error": "Session expired or not found."}, status=400)

        # Deserialize data from cache
        data = json.loads(data)

        # Log the session data
        print(f"Session data found: {data}")

        if timezone.now() > timezone.datetime.fromisoformat(data['created_at']) + timedelta(minutes=10):
            cache.delete(cache_key)  # Clean up expired session
            return Response({"error": "OTP has expired."}, status=400)

        if data['otp'] != otp:
            return Response({"error": "Invalid OTP."}, status=400)

        return Response({"message": "OTP verified successfully.", "session_id": session_id}, status=200)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"detail": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_obj = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            logger.error(f"Login attempt with unregistered email: {email}")
            return Response({"detail": "User not registered"}, status=status.HTTP_404_NOT_FOUND)

        # Now try to authenticate
        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            logger.info(f"Login successful for user: {user.email}")
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            logger.error(f"Incorrect password attempt for email: {email}")
            return Response({"detail": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)


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
        return Response(serializer.errors, status=400)


class HomeView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'message': 'Welcome to the Home page!'}, status=status.HTTP_200_OK)


class StartExerciseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Start an exercise session and record start details."""
        user = request.user
        exercise_data = request.data  # Receive exercise data from frontend

        # Ensure required fields are provided
        required_fields = ['exercise_name', 'body_part', 'workout_exercise_id']
        if not all(field in exercise_data for field in required_fields):
            return Response({"error": "Incomplete exercise data."}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create today's workout
        workout, _ = Workout.objects.get_or_create(
            user=user,
            workout_date=now().date(),
            defaults={'total_time': timedelta(seconds=0), 'total_calories': 0}
        )

        # Create a new workout exercise entry
        workout_exercise = WorkoutExercise.objects.create(
            workout=workout,
            workout_exercise_id=exercise_data['workout_exercise_id'],  # Store API exercise ID
            name=exercise_data.get('exercise_name'),
            body_part=exercise_data.get('body_part'),
            start_date=now().date()
        )

        return Response({
            "message": "Exercise started successfully.",
            "workout_exercise_id": workout_exercise.id
        }, status=status.HTTP_201_CREATED)


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
    page_size = 20  # Default limit to 20 exercises per request
    page_size_query_param = 'limit'
    max_page_size = 100  # Prevent excessive data retrieval

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
            queryset = queryset.filter(name__icontains=search_query)  # Uses idx_name

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