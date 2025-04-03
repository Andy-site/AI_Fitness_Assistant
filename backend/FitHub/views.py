from time import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import UserRegistrationSerializer, WorkoutLibrarySerializer, WorkoutLibraryExerciseSerializer, UserProfileSerializer, ExerciseSerializer, FavoriteExerciseSerializer
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

logger = logging.getLogger(__name__)

def get_user_by_email(email):
    return get_object_or_404(CustomUser, email=email)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)  # Save as inactive
            otp_instance = OTP.objects.create(user=user)  # Create OTP instance
            otp = otp_instance.generate_otp()  # Generate OTP
            
            # Send OTP via email
            try:
                send_mail(
                    'Your OTP Code',
                    f'Your OTP code is {otp}',
                    settings.EMAIL_HOST_USER,
                    [user.email],
                )
                # Include the email in the response so the frontend can access it
                return Response({
                    'message': 'User registered. OTP sent to email.',
                    'email': user.email  # Add email here
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': f'Failed to send OTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class SendOtpView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        user = get_object_or_404(CustomUser, email=email)

        # Ensure OTP exists or create a new one
        otp_instance, created = OTP.objects.get_or_create(user=user)
        
        # Generate and send OTP via email
        try:
            otp = otp_instance.generate_otp()
            send_mail(
                'Your OTP Code',
                f'Your OTP code is {otp}',
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

        # Verify the OTP
        if otp_instance.verify_otp(otp):
            user.is_active = True  # Activate the user
            user.save()
            return Response({'message': 'OTP verified successfully. Account activated.'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.debug(f"Login request data: {request.data}")  # Log the incoming request data

        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            logger.error("Email or password missing.")  # Log if email or password is missing
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
        """Generate and send OTP for password reset"""
        email = request.data.get('email')

        try:
            user = CustomUser.objects.get(email=email)
            otp = user.generate_otp()  # Generate new OTP

            logger.info(f"Password reset OTP generated for {email}")
            logger.info(f"OTP: {otp}")
            logger.info(f"Generation time: {user.otp_created_at}")

            # Send OTP via email
            send_mail(
                'Password Reset OTP',
                f'Your password reset OTP is: {otp}. Valid for 2 minutes.',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            return Response({
                'message': 'Password reset OTP sent successfully',
                'timestamp': timezone.now()
            })

        except CustomUser.DoesNotExist:
            logger.error(f"User not found for password reset: {email}")
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error sending password reset OTP: {str(e)}")
            return Response({
                'error': 'Failed to send OTP'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPasswordResetOtpView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            # Get the user by email
            user = CustomUser.objects.get(email=email)
            
            # Retrieve the latest OTP associated with this user
            otp_record = OTP.objects.filter(user=user).order_by('-created_at').first()

            if otp_record:  # Ensure an OTP record exists
                if otp_record.is_otp_valid(otp):  # Call method on OTP model
                    return Response({'detail': 'OTP verified successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({'detail': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'detail': 'No OTP found for this user'}, status=status.HTTP_400_BAD_REQUEST)

        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.info(f"Reset password payload: {request.data}")
        token = request.data.get('token')  # email
        otp = request.data.get('otp')
        new_password = request.data.get('password')

        logger.info(f"Received fields: token={token}, otp={otp}, password={new_password}")

        if not all([token, otp, new_password]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=token)
            otp_record = OTP.objects.get(user=user)  # Get OTP record

            logger.info(f"Stored OTP: {otp_record.otp}, Received OTP: {otp}")

            if not otp_record.is_otp_valid(otp):
                return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

            # Reset the password
            user.set_password(new_password)
            user.save()

            # Delete the OTP after successful verification
            otp_record.delete()

            logger.info(f"Password reset successful for {user.email}")
            return Response({'message': 'Password reset successful!'})

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({'error': 'No OTP found for this user.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error resetting password: {e}")
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


# -------------------------------------------------------------------
# Exercise database Views
# -------------------------------------------------------------------


class ExerciseListView(ListAPIView):
    """
    API endpoint to list exercises filtered by both category and equipment
    """
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Exercise.objects.all()
        category = self.request.query_params.get('category', None)
        equipment = self.request.query_params.get('equipment', None)

        # Apply category filter if provided
        if category:
            queryset = queryset.filter(category=category)
        
        # Apply equipment filter if provided
        if equipment:
            queryset = queryset.filter(equipment=equipment)

        # Return the filtered queryset, sorted by name
        return queryset.order_by('name')



class ExercisesByEquipmentList(ListAPIView):
    """
    API endpoint to list exercises by equipment
    """
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        equipment = self.kwargs['equipment']
        return Exercise.objects.filter(equipment=equipment).order_by('name')


class ExercisesByCategoryList(ListAPIView):
    """
    API endpoint to list exercises by category
    """
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        category = self.kwargs['category']
        return Exercise.objects.filter(category=category).order_by('name')


class ExerciseCategoriesView(APIView):
    """
    API endpoint to list all unique exercise categories
    """
    def get(self, request):
        categories = Exercise.objects.values_list('category', flat=True).distinct()
        return Response([{"category": cat} for cat in categories])

class ExerciseEquipmentView(APIView):
    """
    API endpoint to list all unique exercise equipment
    """
    def get(self, request):
        equipment = Exercise.objects.values_list('equipment', flat=True).distinct()
        return Response([{"equipment": eq} for eq in equipment])


class CheckFavoriteStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exercise_name):
        """Check if an exercise is in the user's favorites."""
        user = request.user
        
        # Try to find the exercise by name (case insensitive)
        try:
            exercise = Exercise.objects.get(name__iexact=exercise_name)
        except Exercise.DoesNotExist:
            return Response({"error": "Exercise not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the exercise is in the user's favorite list
        is_favorite = FavoriteExercise.objects.filter(user=user, exercise=exercise).exists()
        return Response({"is_favorite": is_favorite})


class ToggleFavoriteExercise(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add or remove exercise from favorites."""
        user = request.user
        exercise_name = request.data.get("exercise_name")

        if not exercise_name:
            return Response({"error": "Exercise name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find the exercise by name (case insensitive)
        try:
            exercise = Exercise.objects.get(name__iexact=exercise_name)
        except Exercise.DoesNotExist:
            return Response({"error": "Exercise not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the exercise is already in the user's favorite list
        favorite, created = FavoriteExercise.objects.get_or_create(user=user, exercise=exercise)

        if created:
            return Response({"message": f"{exercise_name} added to favorites"}, status=status.HTTP_201_CREATED)
        else:
            # If the exercise is already in favorites, remove it
            favorite.delete()
            return Response({"message": f"{exercise_name} removed from favorites"}, status=status.HTTP_200_OK)

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