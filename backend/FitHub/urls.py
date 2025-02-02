from django.urls import path
from . import views

urlpatterns = [
    
    path('register/', views.RegisterView, name='register'),
    path('user-details/', views.get_user_details, name='user-details'),
    path('send-otp/', views.SendOtpView, name='send-otp'),
    path('verify-otp/', views.VerifyOtpView, name='verify-otp'),
    path('login/', views.LoginView, name='login'),  
    path('reset-password/', views.reset_password, name='reset-password'),
    path('home/', views.HomeView, name='home'),
    path('forgot-password/otp/', views.ForgotPasswordOTPView, name='forgot-password-otp'),
    path('forgot-password/verify/', views.VerifyPasswordResetOTPView, name='verify-password-reset-otp'),
    path('reset-password/', views.reset_password, name='reset-password'),

    
]