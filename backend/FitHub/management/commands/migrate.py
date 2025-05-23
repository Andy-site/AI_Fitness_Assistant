from django.core.management.base import BaseCommand
from FitHub.models import PoseExerciseSet

class Command(BaseCommand):
    help = "Recalculates and updates calories burned for all PoseExerciseSet records"

    def handle(self, *args, **kwargs):
        sets = PoseExerciseSet.objects.all()
        for set in sets:
            set.calculate_calories()
        self.stdout.write(self.style.SUCCESS('Calories updated for all PoseExerciseSet entries.'))
