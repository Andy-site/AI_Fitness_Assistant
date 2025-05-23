from django.urls import path
from . import views

urlpatterns = [

    # ==============================  AUTHENTICATION ==============================

    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('send-otp/', views.SendOtpView.as_view(), name='send_otp'),
    path('verify-otp/', views.VerifyOtpView.as_view(), name='verify_otp'),

    # ==========================  PASSWORD RESET FLOW ============================

    path('request-password-reset-otp/', views.ForgotPasswordOTPView.as_view()),
    path('verify-password-reset-otp/', views.VerifyPasswordResetOtpView.as_view()),
    path('reset-password/', views.ResetPasswordView.as_view()),

    # ===============================  USER PROFILE ===============================

    path('user/profile/', views.UserDetailsView.as_view(), name='user_details'),
    path('user/profile/update/', views.UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('user/calorie-goal/', views.CalorieGoalView.as_view(), name='calorie-goal'),

    # ==============================  PROGRESS + SUMMARY ==========================

    path('progress/summary/', views.CalorieProgressSummaryView.as_view(), name='calorie-progress-summary'),
    path('progress/exercise/', views.ExerciseProgressView.as_view(), name='exercise-progress'),
    path('daily-summary/', views.DailySummaryView.as_view(), name='daily-summary'),
    path('daily-calorie-summary/', views.DailyCalorieSummaryView.as_view(), name='daily_calorie_summary'),
    path('visualization/', views.ProgressVisualizationAPIView.as_view(), name='progress_visualization'),
    path('workout-stats/', views.WorkoutStatsView.as_view(), name='workout-stats'),

    # ===============================  EXERCISE TRACKING ==========================

    path('exercises/', views.ExerciseListView.as_view(), name='exercise_list'),
    path('start-exercise/', views.StartExerciseView.as_view(), name='start_exercise'),
    path('end-exercise/', views.EndExerciseView.as_view(), name='end_exercise'),
    path('cancel-exercise/<int:workout_exercise_id>/', views.CancelExerciseView.as_view(), name='cancel-exercise'),
    path('log-exercise-performance/', views.LogExercisePerformanceView.as_view(), name='log_exercise_performance'),
    path('recommend-exercise/', views.RecommendExercisesView.as_view(), name='recommend-top-exercise'),
    path('workout-dates/', views.WorkoutDatesView.as_view(), name='workout_dates'),

    # ===============================  FAVORITE EXERCISES =========================

    path('favorites/', views.FavoriteExerciseView.as_view(), name='favorite_exercises'),
    path('favorites/<int:favorite_id>/', views.FavoriteExerciseView.as_view(), name='favorite_exercise_detail'),
    path('toggle-favorite/', views.ToggleFavoriteExercise.as_view(), name='toggle_favorite_exercise'),

    # ================================  WORKOUT LIBRARY ==========================

    path('workout-libraries/', views.WorkoutLibraryListView.as_view(), name='workout_libraries'),
    path('workout-libraries/create/', views.WorkoutLibraryCreateView.as_view(), name='create_workout_library'),
    path('workout-libraries/<int:library_id>/delete/', views.WorkoutLibraryDeleteView.as_view(), name='delete_workout_library'),
    path('workout-libraries/<int:library_id>/exercises/add/', views.WorkoutLibraryExerciseAddView.as_view(), name='add_exercise_to_library'),
    path('workout-libraries/<int:library_id>/exercises/', views.WorkoutLibraryExerciseListView.as_view(), name='get_library_exercises'),
    path('workout-libraries/<int:library_id>/exercises/<int:exercise_id>/delete/', views.WorkoutLibraryExerciseDeleteView.as_view(), name='delete_library_exercise'),

    # =================================  MEAL PLANS ==============================

    path('meal-plans/', views.MealPlanListView.as_view(), name='meal_plan_list'),
    path('meal-plans/create/', views.MealPlanCreateView.as_view(), name='meal_plan_create'),
    path('meal-plans/stats/', views.MealPlanStatsView.as_view(), name='meal_plan_stats'),
     path('meal-plans/range/', views.MealPlanRangeView.as_view(), name='meal-plans-range'),
    path('meal-plans/<int:meal_id>/update-consumed/', views.UpdateMealConsumedStatusView.as_view(), name='update_meal_consumed'),
    path('meal-plans/bulk-update-consumed/', views.BulkUpdateMealConsumedStatusView.as_view(), name='bulk_update_meal_consumed'),
    path('recommended-meals/', views.RecommendedMealView.as_view(), name='recommended-meals'),
    path('backend-meals/', views.BackendMealsView.as_view(), name='backend_meals'),
    path('meals/history/', views.MealHistoryView.as_view(), name='meal-history'),

    # ================================  POSE ESTIMATION ===========================

    path('pose-session/', views.PoseEstimationSessionCreateView.as_view(), name='pose-session-create'),
    path('pose-session/<int:session_id>/complete/', views.PoseEstimationSessionCompleteView.as_view(), name='pose-session-complete'),
    path('pose-feedback/', views.PoseFeedbackCreateView.as_view(), name='pose-feedback-create'),
    path('fitness-summary/', views.DailyFitnessSummaryView.as_view(), name='fitness-summary'),
    path('calories-by-pose/', views.CaloriesByPoseView.as_view(), name='calories-by-pose'),

    path('', views.HomeView.as_view(), name='home'),
]
