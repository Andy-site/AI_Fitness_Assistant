from django.urls import path
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
    
    # Workout Library Exercise URLs
    path('workout-libraries/<int:library_id>/exercises/', views.WorkoutLibraryExerciseListView.as_view(), name='list_library_exercises'),
    path('workout-libraries/<int:library_id>/exercises/add/', views.WorkoutLibraryExerciseAddView.as_view(), name='add_exercise_to_library'),
    path('workout-libraries/<int:library_id>/exercises/<int:exercise_id>/delete/', views.WorkoutLibraryExerciseDeleteView.as_view(), name='delete_library_exercise'),
    
    #exercise
    path('exercises/', views.ExerciseListView.as_view(), name='exercise-list'),
    path('toggle-favorite/', views.ToggleFavoriteExercise.as_view(), name='toggle_favorite'),
    path('favorites/', views.FavoriteExerciseView.as_view(), name='favorite_exercises'),
    path('favorites/<int:favorite_id>/', views.FavoriteExerciseView.as_view(), name='delete_favorite'),
    path('exercises/equipment/<str:equipment>/', views.ExercisesByEquipmentList.as_view(), name='exercises-by-equipment'), path('favorites/', views.ToggleFavoriteExercise.as_view(), name='toggle_favorite_exercise'),    path('exercises/equipment/<str:equipment>/', views.ExercisesByEquipmentList.as_view(), name='exercises-by-equipment'),
    path('exercises/category/<str:category>/', views.ExercisesByCategoryList.as_view(), name='exercises-by-category'),
    path('exercises/categories/', views.ExerciseCategoriesView.as_view(), name='exercise-categories'),  # New endpoint for categories
    path('exercises/equipment/', views.ExerciseEquipmentView.as_view(), name='exercise-equipment'),  # New endpoint for equipment
    # Home URL
    path('', views.HomeView.as_view(), name='home'),
]