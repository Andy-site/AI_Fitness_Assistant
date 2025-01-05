from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomRegisterSerializer

class HomePageData(APIView):
    
    def get(self, request):
        return Response({"message": "Welcome to FitHub Fitness Dashboard!"})
    
class UserRegisterView(APIView):
    def post(self, request):
        # Parse the incoming data
        serializer = CustomRegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Create the user
            user = serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(email=email, password=password)

        if user is not None:
            # Generate JWT tokens for the user
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)