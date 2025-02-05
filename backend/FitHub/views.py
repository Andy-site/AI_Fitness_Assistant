from time import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import UserRegistrationSerializer
from .models import CustomUser, WorkoutExercise, ExercisePerformance, Workout, OTP
import logging
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.timezone import now
from datetime import timedelta


logger = logging.getLogger(__name__)

def get_user_by_email(email):
    return get_object_or_404(CustomUser, email=email)

@api_view(['POST'])
def RegisterView(request):
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


@api_view(['POST'])
def SendOtpView(request):
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


@api_view(['POST'])
def VerifyOtpView(request):
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


@api_view(['POST'])
def LoginView(request):
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


@api_view(['POST'])
@permission_classes([AllowAny])
def ForgotPasswordOTPView(request):
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


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_password_reset_otp(request):
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



@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
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




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    """Retrieve details of the authenticated user."""
    user = request.user  # The authenticated user

    # Serialize the user data
    serializer = UserRegistrationSerializer(user)

    return Response(serializer.data)

@api_view(['GET'])
def HomeView(request):
        return Response({'message': 'Welcome to the Home page!'}, status=status.HTTP_200_OK)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateWorkout(request):
    """Create a new workout for the authenticated user."""
    user = request.user
    workout_data = request.data
    workout = Workout.objects.create(
        user=user,
        workout_date=now().date(),
        total_time=timedelta(seconds=workout_data.get('total_time', 0)),
        total_calories=workout_data.get('total_calories', 0),
        custom_workout_name=workout_data.get('custom_workout_name', None)
    )

    for exercise_data in workout_data.get('exercises', []):
        WorkoutExercise.objects.create(
            workout=workout,
            exercise_name=exercise_data.get('exercise_name'),
            body_part=exercise_data.get('body_part'),
            exercise_date=now().date(),
            start_time=now(),
            duration=timedelta(seconds=exercise_data.get('duration', 0))
        )

    return Response({'message': 'Workout created successfully.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def LogExercisePerformance(request):
    """Log exercise performance (sets, reps, weight)."""
    workout_exercise_id = request.data.get('workout_exercise_id')
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
