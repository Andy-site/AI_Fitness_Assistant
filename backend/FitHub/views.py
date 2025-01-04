from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from .models import User
from .serializers import UserSerializer

class HomePageData(APIView):
    def get(self, request):
        return Response({"message": "Welcome to FitHub Fitness Dashboard!"})
    
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
