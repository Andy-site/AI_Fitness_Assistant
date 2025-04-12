from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    
    # Authentication URLs
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('send-otp/', views.SendOtpView.as_view(), name='send_otp'),
    path('verify-otp/', views.VerifyOtpView.as_view(), name='verify_otp'),

    # Password Reset URLs
    path('request-password-reset-otp/', views.ForgotPasswordOTPView.as_view()),
    path('verify-password-reset-otp/', views.VerifyPasswordResetOtpView.as_view()),
    path('reset-password/', views.ResetPasswordView.as_view()),

    # Calorie Goal

    # User Profile URLs
    path('user/profile/', views.UserDetailsView.as_view(), name='user_details'),
    path('user/profile/update/', views.UserProfileUpdateView.as_view(), name='user_profile_update'),

    # Exercise URLs
    path('start-exercise/', views.StartExerciseView.as_view(), name='start_exercise'),
    path('end-exercise/', views.EndExerciseView.as_view(), name='end_exercise'),
    path('log-exercise-performance/', views.LogExercisePerformanceView.as_view(), name='log_exercise_performance'),

    # Workout Library URLs
    path('workout-libraries/', views.WorkoutLibraryListView.as_view(), name='workout_libraries'),
    path('workout-libraries/create/', views.WorkoutLibraryCreateView.as_view(), name='create_workout_library'),
    path('workout-libraries/<int:library_id>/delete/', views.WorkoutLibraryDeleteView.as_view(), name='delete_workout_library'),

    path('meal-plans/', views.MealPlanListView.as_view(), name='meal-plan-list'),
    path('meal-plans/create/', views.MealPlanCreateView.as_view(), name='meal-plan-create'),
    path('meal-plans/stats/', views.MealPlanStatsView.as_view(), name='meal-plan-stats'),
    path('backend-meals/', views.BackendMealsView.as_view(), name='backend-meals'),
    path('meal-plans/<int:meal_id>/update-consumed/', views.UpdateMealConsumedStatusView.as_view(), name='update-meal-consumed'),
    path('meal-plans/bulk-update-consumed/', views.BulkUpdateMealConsumedStatusView.as_view(), name='bulk-update-meal-consumed'),
    # Home URL
    path('', views.HomeView.as_view(), name='home'),

]