from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import UserRegistrationSerializer
from .models import CustomUser
import logging

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

        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(email=email, password=password)
        if user is not None:
            # Create JWT token
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )