from django.urls import path, include
from . import views


urlpatterns = [
    path('home/', views.HomePageData.as_view(), name='home-api'),  # API endpoint
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    
]
