import json
import requests
from django.core.management.base import BaseCommand
from FitHub.models import Exercise

class Command(BaseCommand):
    help = 'Fetches exercise data and saves it to the database'

    def handle(self, *args, **kwargs):
        # URL to the free exercise JSON file
        url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

        try:
            response = requests.get(url)
            response.raise_for_status()  # Check if request was successful

            exercises_data = response.json()

            # Loop through each exercise and save it in the database
            for exercise in exercises_data:
                # Set default values for missing fields
                mechanic = exercise.get('mechanic', '')  # Default to empty string if missing
                force = exercise.get('force', '')  # Default to empty string if missing
                level = exercise.get('level', '')  # Default to empty string if missing

                # Save or update exercise data
                Exercise.objects.update_or_create(
                    id=exercise['id'],
                    defaults={
                        'name': exercise.get('name', ''),
                        'force': force,
                        'level': level,
                        'mechanic': mechanic,
                        'equipment': exercise.get('equipment', ''),
                        'category': exercise.get('category', ''),
                        'primary_muscles': exercise.get('primaryMuscles', []),
                        'secondary_muscles': exercise.get('secondaryMuscles', []),
                        'instructions': exercise.get('instructions', []),
                        'images': exercise.get('images', []),
                    }
                )
            self.stdout.write(self.style.SUCCESS("Successfully imported exercise data"))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Error fetching data: {e}"))
