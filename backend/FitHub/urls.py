from django.urls import path
from .views import HomePageData
from .views import UserRegisterView

urlpatterns = [
    path('api/home/', HomePageData.as_view(), name='home-api'),  # API endpoint
    path('register/', UserRegisterView.as_view(), name='register'),
]
