# FitHub/views
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer

@api_view(['POST'])
def RegisterView(request):
    # Create a serializer instance with the incoming data
    serializer = UserRegistrationSerializer(data=request.data)
    
    # Validate the data
    if serializer.is_valid():
        # If valid, save the user and return a success response
        serializer.save()
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    else:
        # Log the validation errors for debugging
        print("Validation Errors: ", serializer.errors)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
