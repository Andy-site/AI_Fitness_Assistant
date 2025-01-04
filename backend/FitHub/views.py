from rest_framework.views import APIView
from rest_framework.response import Response

class HomePageData(APIView):
    def get(self, request):
        return Response({"message": "Welcome to FitHub Fitness Dashboard!"})
