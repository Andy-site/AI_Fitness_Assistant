from django.core.management.base import BaseCommand
from FitHub.models import WorkoutExercise, ExercisePerformance, ExerciseHistory

class Command(BaseCommand):
    help = 'Migrate existing WorkoutExercise and ExercisePerformance to ExerciseHistory'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting ExerciseHistory migration...'))

        total_created = 0

        for workout_exercise in WorkoutExercise.objects.all():
            user = workout_exercise.workout.user
            exercise = workout_exercise.exercise
            workout = workout_exercise.workout
            start_date = workout_exercise.start_date

            # Fetch all performance sets for this workout exercise
            performances = workout_exercise.performance.all()

            if performances.exists():
                for perf in performances:
                    ExerciseHistory.objects.create(
                        user=user,
                        exercise=exercise,
                        workout=workout,
                        date=start_date,
                        sets=1,  # each set separately
                        reps_per_set=perf.reps,
                        weight_per_set=perf.weight,
                    )
                    total_created += 1

        self.stdout.write(self.style.SUCCESS(f'Migration complete! {total_created} ExerciseHistory records created.'))
