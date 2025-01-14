from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import UserRegistrationSerializer
from .models import CustomUser
import logging
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework.permissions import AllowAny, IsAuthenticated

logger = logging.getLogger(__name__)

def get_user_by_email(email):
    return get_object_or_404(CustomUser, email=email)

@api_view(['POST'])
def RegisterView(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save(is_active=False)  # Save as inactive
        user.generate_otp()  # Generate OTP
        try:
            send_mail(
                'Your OTP Code',
                f'Your OTP code is {user.otp}',
                settings.EMAIL_HOST_USER,
                [user.email],
            )
            return Response({'message': 'User registered. OTP sent to email.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to send OTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def SendOtpView(request):
    email = request.data.get('email')
    user = get_user_by_email(email)

    try:
        user.generate_otp()
        send_mail(
            'Your OTP Code',
            f'Your OTP code is {user.otp}',
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
    if user.is_otp_valid(otp):
        user.is_active = True  # Activate the user
        user.otp = None  # Clear the OTP
        user.otp_created_at = None  # Clear OTP timestamp
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
def ForgotPasswordTokenView( request):
        email = request.data.get('email')

        # Validate if email exists
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise ValidationError("User with this email does not exist.")

        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        reset_token = str(refresh.access_token)

        # Create reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"

        # Send email with the reset link
        send_mail(
            subject="Password Reset Request",
            message=f"Use the following link to reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "Password reset email sent!"})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    # Extract token and OTP from the request
    token = request.data.get('token')
    otp = request.data.get('otp')
    new_password = request.data.get('password')

    if not token or not otp or not new_password:
        return Response({"error": "Token, OTP, and password are required."}, status=400)

    try:
        # Check if the user exists from the token
        # Assuming token contains email or decode the token to extract email
        user = CustomUser.objects.get(email=token)  # Use email instead of id

        # Validate OTP
        if not user.is_otp_valid(otp):
            return Response({"error": "Invalid or expired OTP."}, status=400)

        # Reset the password if OTP is valid
        user.set_password(new_password)
        user.otp = None  # Clear OTP after successful reset
        user.save()

        return Response({"message": "Password reset successful!"})

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only authenticated users can access this view
def HomeView(request):
    """
    Home page view, accessible only to authenticated users.
    """
    return Response({
        "message": "Welcome to the Home Page! You are successfully authenticated."
    })
    