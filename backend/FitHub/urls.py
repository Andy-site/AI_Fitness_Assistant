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
 path('exercises/', views.ExerciseListView.as_view(), name='exercise_list'),
    path('start-exercise/', views.StartExerciseView.as_view(), name='start_exercise'),
    path('end-exercise/', views.EndExerciseView.as_view(), name='end_exercise'),
    path('log-exercise-performance/', views.LogExercisePerformanceView.as_view(), name='log_exercise_performance'),

    # Workout Library URLs
    path('workout-libraries/', views.WorkoutLibraryListView.as_view(), name='workout_libraries'),
    path('workout-libraries/create/', views.WorkoutLibraryCreateView.as_view(), name='create_workout_library'),
    path('workout-libraries/<int:library_id>/delete/', views.WorkoutLibraryDeleteView.as_view(), name='delete_workout_library'),
    path('workout-libraries/<int:library_id>/exercises/add/', views.WorkoutLibraryExerciseAddView.as_view(), name='add_exercise_to_library'),
    path('workout-libraries/<int:library_id>/exercises/', views.WorkoutLibraryExerciseListView.as_view(), name='get_library_exercises'),
    path('workout-libraries/<int:library_id>/exercises/<int:exercise_id>/delete/', views.WorkoutLibraryExerciseDeleteView.as_view(), name='delete_library_exercise'),
    path('workout-dates/', views.WorkoutDatesView.as_view(), name='workout_dates'),
    # Favorite Exercise URLs
    path('favorites/', views.FavoriteExerciseView.as_view(), name='favorite_exercises'),
    path('favorites/<int:favorite_id>/', views.FavoriteExerciseView.as_view(), name='favorite_exercise_detail'),
    path('toggle-favorite/', views.ToggleFavoriteExercise.as_view(), name='toggle_favorite_exercise'),

    # Meal Plan URLs
    path('meal-plans/', views.MealPlanListView.as_view(), name='meal_plan_list'),
    path('meal-plans/create/', views.MealPlanCreateView.as_view(), name='meal_plan_create'),
    path('meal-plans/stats/', views.MealPlanStatsView.as_view(), name='meal_plan_stats'),
    path('backend-meals/', views.BackendMealsView.as_view(), name='backend_meals'),
    path('meal-plans/<int:meal_id>/update-consumed/', views.UpdateMealConsumedStatusView.as_view(), name='update_meal_consumed'),
    path('meal-plans/bulk-update-consumed/', views.BulkUpdateMealConsumedStatusView.as_view(), name='bulk_update_meal_consumed'),

    # Calorie Summary URL
    path('daily-calorie-summary/', views.DailyCalorieSummaryView.as_view(), name='daily_calorie_summary'),
    path('calorie-goal/', views.CalorieGoalView.as_view(), name='calorie_goal'),

    #Home page URL
    path('', views.HomeView.as_view(), name='home'),

]