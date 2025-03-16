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
    path('log-exercise-performance/', views.LogExercisePerformance, name='log-exercise-performance'),
    path('start-exercise/', views.StartExercise, name='start-exercise'),
    path('end-exercise/', views.EndExercise, name='end-exercise'),


    path('libraries/', views.list_workout_libraries, name='list-libraries'),
    path('libraries/create/', views.create_workout_library, name='create-library'),
    path('libraries/<int:library_id>/delete/', views.delete_workout_library, name='delete-library'),

    # WorkoutLibraryExercise endpoints (nested under a library)
    path('libraries/<int:library_id>/exercises/', views.list_library_exercises, name='list-library-exercises'),
    path('libraries/<int:library_id>/exercises/add/', views.add_exercise_to_library, name='add-exercise-to-library'),
    path('libraries/<int:library_id>/exercises/<int:exercise_id>/delete/', views.delete_library_exercise, name='delete-library-exercise'),

    path('profile/update/', views.user_profile_update, name='profile-update'),
]



    
