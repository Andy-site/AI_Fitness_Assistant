import requests
from FitHub.models import Exercise


API_URL = "https://exercisedb.p.rapidapi.com/exercises"
HEADERS = {
    "x-rapidapi-key": "3ad4a2f8admsh440268a18f36360p163235jsne9d005b72609",
    "x-rapidapi-host": "exercisedb.p.rapidapi.com"
}
LIMIT = 10  # Fetch in batches of 10

def fetch_and_save_exercises():
    offset = 0
    while True:
        response = requests.get(f"{API_URL}?limit={LIMIT}&offset={offset}", headers=HEADERS)
        
        if response.status_code != 200:
            print(f"Error fetching exercises: {response.status_code}")
            break
        
        exercises = response.json()
        if not exercises:  # Stop when no more exercises
            break
        
        for exercise in exercises:
            Exercise.objects.get_or_create(
                name=exercise["name"],
                 defaults={
        "category": exercise.get("bodyPart", ""),
        "equipment": exercise.get("equipment", ""),
        "description": "\n".join(exercise.get("instructions", [])) if exercise.get("instructions") else "",
        "image_url": exercise.get("gifUrl", ""),
        "secondary": ", ".join(exercise.get("secondaryMuscles", [])) if exercise.get("secondaryMuscles") else "",
    }
            )
        
        print(f"Fetched and saved {len(exercises)} exercises, offset: {offset}")
        offset += LIMIT  # Move to next batch

    print("All exercises fetched and saved.")
