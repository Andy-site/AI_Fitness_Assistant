# FitHub/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserRegistrationSerializer
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info(f"Received registration request with data: {request.data}")
        
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            logger.info("Data validation successful")
            user = serializer.save()
            response_data = {
                'success': True,
                'message': 'Registration successful',
                'user': UserRegistrationSerializer(user).data
            }
            logger.info(f"Registration successful for email: {user.email}")
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Registration failed with errors: {serializer.errors}")
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)