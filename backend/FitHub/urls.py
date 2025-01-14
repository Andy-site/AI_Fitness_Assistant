from django.urls import path
from . import views

urlpatterns = [
    
    path('register/', views.RegisterView, name='register'),
    path('send-otp/', views.SendOtpView, name='send-otp'),
    path('verify-otp/', views.VerifyOtpView, name='verify-otp'),
    path('api/token/', views.LoginView, name='token_obtain_pair'),
    
]