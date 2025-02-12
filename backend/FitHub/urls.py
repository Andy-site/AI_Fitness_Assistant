from django.urls import path
from . import views

urlpatterns = [
    
    path('register/', views.RegisterView, name='register'),
    path('user-details/', views.get_user_details, name='get_user_details'),
    path('send-otp/', views.SendOtpView, name='send-otp'),
    path('verify-otp/', views.VerifyOtpView, name='verify-otp'),
    path('login/', views.LoginView, name='login'),  
    path('reset-password/', views.reset_password, name='reset-password'),
    path('home/', views.HomeView, name='home'),
    path('forgot-password/otp/', views.ForgotPasswordOTPView, name='forgot-password-otp'),
    path('forgot-password/verify/', views.verify_password_reset_otp, name='verify-password-reset-otp'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('bodyParts/', views.body_part_list, name='body_part_list'),
    path('exercises/bodyPart/<str:body_part>/', views.exercise_list, name='exercise_list_by_part'),
]

    
