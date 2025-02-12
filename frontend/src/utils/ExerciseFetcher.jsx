export const fetchData = async (url, options) => {
  console.log(`Sending request to: ${url}`);  // Log URL to verify
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error('HTTP error:', response.statusText);
      return null;
    }
    const data = await response.json();
    console.log('Response data:', data);  // Log data received
    return data;
  } catch (error) {
    console.error('Error in fetch:', error);
    return null;
  }
};

// Fetch Body Parts (now using 'primary_muscles' as the body part)
export const fetchBodyParts = async () => {
  const url = 'http://192.168.0.117:8000/api/bodyParts/';
  return fetchData(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Fetch Exercises for a specific primary muscle
export const fetchExercisesForBodyPart = async (primaryMuscle) => {
  const url = `http://192.168.0.117:8000/api/exercises/bodyPart/${primaryMuscle}/`;
  return fetchData(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
