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
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.timezone import now

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
      


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only authenticated users can access this view
def HomeView(request):
    """
    Home page view, accessible only to authenticated users.
    """
    return Response({
        "message": "Welcome to the Home Page! You are successfully authenticated."
    })
    
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
            'timestamp': now()
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
def VerifyPasswordResetOTPView(request):
    """Verify OTP for password reset"""
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    logger.info(f"Verifying password reset OTP for {email}")
    
    try:
        user = CustomUser.objects.get(email=email)
        logger.info(f"Stored OTP: {user.otp}")
        logger.info(f"Received OTP: {otp}")
        logger.info(f"OTP created at: {user.otp_created_at}")
        
        if user.is_otp_valid(otp):
            return Response({
                'message': 'OTP verified successfully'
            })
        else:
            return Response({
                'error': 'Invalid or expired OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    logger.info(f"Reset password payload: {request.data}")
    token = request.data.get('token')  # email
    otp = request.data.get('otp')
    new_password = request.data.get('password')

    # Print received values for debugging
    print(f"Received token (email): {token}")
    print(f"Received OTP: {otp}")
    print(f"Received new password: {new_password}")

    logger.info(f"Received fields: token={token}, otp={otp}, password={new_password}")

    if not all([token, otp, new_password]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email=token)
        logger.info(f"Stored OTP: {user.otp}, Received OTP: {otp}")
        
        # Ensure OTP received is numeric (if that is expected)
        if not otp.isdigit():
            return Response({'error': 'OTP must be a valid numeric value.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_otp_valid(otp):
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.otp = None
        user.otp_created_at = None
        user.save()

        logger.info(f"Password reset successful for {user.email}")
        return Response({'message': 'Password reset successful!'})

    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
