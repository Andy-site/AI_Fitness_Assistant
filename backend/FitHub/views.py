# FitHub/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserRegistrationSerializer


class RegisterView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        else:
            # Log the errors for debugging
            print("Validation Errors: ", serializer.errors)  # Logs errors in the console
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
