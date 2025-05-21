import random
from django.core.management.base import BaseCommand
from FitHub.models import WorkoutExercise, ExercisePerformance, ExerciseHistory

class Command(BaseCommand):
    help = 'Backfill ExercisePerformance and ExerciseHistory from existing WorkoutExercises'

    def handle(self, *args, **kwargs):
        for we in WorkoutExercise.objects.filter(exercise__isnull=False, workout__isnull=False):
            workout = we.workout
            user = workout.user
            exercise = we.exercise
            workout_date = workout.workout_date

            # Skip if already backfilled
            if ExerciseHistory.objects.filter(user=user, exercise=exercise, date=workout_date).exists():
                continue

            sets = random.randint(3, 5)
            total_reps = 0
            total_weight = 0

            self.stdout.write(f"Backfilling for {user.email} - {exercise.name} on {workout_date}")

            for set_number in range(1, sets + 1):
                reps = random.choice([8, 10, 12])
                weight = round(random.uniform(10.0, 50.0), 1)

                total_reps += reps
                total_weight += weight

                ExercisePerformance.objects.create(
                    workout_exercise=we,
                    set_number=set_number,
                    reps=reps,
                    weight=weight
                )

            ExerciseHistory.objects.create(
                user=user,
                exercise=exercise,
                workout=workout,
                date=workout_date,
                sets=sets,
                reps_per_set=round(total_reps / sets),
                weight_per_set=round(total_weight / sets),
            )

        self.stdout.write(self.style.SUCCESS("Finished backfilling exercise data."))
