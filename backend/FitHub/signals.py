from django.db.models.signals import post_save
from django.dispatch import receiver
from FitHub.models import ExercisePerformance, ExerciseHistory, PoseEstimationSession, PoseExerciseSet
from datetime import date

@receiver(post_save, sender=ExercisePerformance)
def create_exercise_history(sender, instance, created, **kwargs):
    if not created:
        return  # only create on first save

    we = instance.workout_exercise
    if not we or not we.workout or not we.exercise:
        return

    ExerciseHistory.objects.create(
        user=we.workout.user,
        exercise=we.exercise,
        workout=we.workout,
        workout_exercise=we,
        date=we.start_date,
        sets=1,
        reps_per_set=instance.reps,
        weight_per_set=instance.weight
    )


@receiver(post_save, sender=PoseEstimationSession)
def handle_pose_session_end(sender, instance, created, **kwargs):
    # Only proceed if the session is ended and marked completed
    if instance.ended_at and instance.completed:
        # Check if PoseExerciseSet already exists
        pose_set, created_set = PoseExerciseSet.objects.get_or_create(
            session=instance,
            defaults={
                'user': instance.user,
                'date': instance.ended_at.date() if instance.ended_at else date.today(),
                'duration_seconds': instance.duration() or 0.0,
            }
        )
        
        # Update if it already exists
        if not created_set:
            pose_set.duration_seconds = instance.duration() or 0.0
            pose_set.date = instance.ended_at.date() if instance.ended_at else date.today()
            pose_set.save(update_fields=['duration_seconds', 'date'])

        # Calculate calories (if exercise is attached)
        pose_set.calculate_calories()
