import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://192.168.0.117:8000/api/'; // Replace with your actual server IP and port
const API_BASE_URL = 'http://localhost:8000/api/';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});



// API call for registering the user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('register/', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'An error occurred during registration.' };
  }
};

// **Login Function**
export const loginUser = async (email, password) => {
  try {
    const loginUrl = `${API_BASE_URL}login/`;
    

    const response = await apiClient.post('login/', { email, password });


    if (response.data.access && response.data.refresh) {
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      console.log(response.data.access);
      console.log('Tokens stored successfully');
      
      
      // Fetch user details after successful login
      try {
        const userDetails = await fetchUserDetails();
        console.log('User details fetched and stored after login:', userDetails);
      } catch (detailsError) {
        console.error('Failed to fetch user details after login:', detailsError);
      }
      
      return response.data;
    } else {
      throw new Error('Missing access or refresh token in response');
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchDailySummary = async (date = null) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get(`summary/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { date }, // pass null for today's summary
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily summary:', error.response?.data || error.message);
    throw error;
  }
};

export const recalculateCalories = async () => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.post(`recalculate-calories/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error recalculating calories:', error.response?.data || error.message);
    throw error;
  }
};


export const previewCalories = async (exerciseName, duration) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.post(
      `preview-calories/`,
      { exercise_name: exerciseName, duration }, // duration in minutes
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error previewing calories:', error.response?.data || error.message);
    throw error;
  }
};



// **Get Token Function**
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    // console.log('Retrieved auth token:', token);
    
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error.message);
    return null;
  }
};

// **Get Refresh Token Function**
export const getRefreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem('refresh_token');
    // console.log('Retrieved refresh token:', token);
    return token;
  } catch (error) {
    console.error('Error retrieving refresh token:', error.message);
    return null;
  }
};

// **Logout Function**
export const logout = async () => {
  try {
    const refreshToken = await getRefreshToken(); // Get the refresh token
    const accessToken = await getAuthToken(); // Get the access token

    if (refreshToken && accessToken) {
      // Sending both refresh token in body and access token in headers
      const response = await apiClient.post('logout/', 
        { refresh: refreshToken }, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Sending access token for authentication
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        // Successfully logged out, remove tokens from storage
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        console.log('Logged out successfully');
      } else {
        console.log('Error logging out:', response.data?.detail || 'Failed to log out');
      }
    } else {
      console.log('No refresh token found. You are already logged out.');
    }
  } catch (error) {
    console.error('Error during logout:', error.message || error);
  }
};

export const updateUserProfile = async (formData) => {
  try {
    const token = await getAuthToken();
    
    const response = await apiClient.put('user/profile/update/', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });

    if (response.data) {
      return response.data;
    }
    throw new Error('No data received from server');
  } catch (error) {
    console.error('Update Profile error:', error.response?.data || error.message);
    
    // Handle specific validation errors
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle goal weight validation errors
      if (errorData.goal_weight) {
        throw {
          type: 'validation',
          field: 'goal_weight',
          message: errorData.goal_weight[0]
        };
      }
      
      // Handle other field-specific errors
      if (errorData.height) {
        throw {
          type: 'validation',
          field: 'height',
          message: errorData.height[0]
        };
      }
      
      if (errorData.weight) {
        throw {
          type: 'validation',
          field: 'weight',
          message: errorData.weight[0]
        };
      }
    }
    
    // Handle generic errors
    throw {
      type: 'error',
      message: 'Failed to update profile. Please try again.'
    };
  }
};

// **Send OTP to Email**
export const sendOtp = async (email) => {
  try {
    const response = await apiClient.post('send-otp/', { email });
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Error sending OTP.' };
  }
};

// **Verify OTP**
export const verifyOtp = async (email, otp) => {
  try {
    const response = await apiClient.post('verify-otp/', { email, otp });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Invalid OTP or an error occurred.' };
  }
};

export const fetchCalorieGoal = async () => {
  const yourToken = await getAuthToken(); // Get the authentication token
  try {
    const response = await axios.get(`${API_BASE_URL}user/calorie-goal/`, {
      headers: {
        Authorization: `Bearer ${yourToken}`, // set up your auth token system
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching calorie goal:", error);
    return {
      daily_calorie_goal: 1800,
      goal_duration_days: 90,
      goal_type: "Unknown"
    };
  }
};

// **Fetch User Details**
export const fetchUserDetails = async () => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    // console.log('Stored token:', token);
    
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await apiClient.get('user/profile/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await AsyncStorage.setItem('user_details', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch user details.' };
  }
};

// API call for sending a password reset token
export const forgotPasswordRequest = async (email) => {
  console.log('[ForgotPassword] Sending OTP request for:', email);

  try {
    const response = await apiClient.post('forgot-password/otp/', { email });
    return response.data;
  } catch (error) {
    console.error('[ForgotPassword] Error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to send OTP for password reset.' };
  }
};

// API call for verifying OTP before password reset
export const verifyPasswordResetOTP = async (email, otp) => {
  try {
    const response = await apiClient.post('verify-password-reset-otp/', { email, otp });
    return response.data;
  } catch (error) {
    console.error('[VerifyOTP] Verification failed:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to verify OTP' };
  }
};

// API call for resending OTP
export const resendOTP = async (email) => {
  try {
    const response = await apiClient.post('resend-otp/', { email });
    return response.data;
  } catch (error) {
    console.error('[ResendOTP] Error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};

// API call for resetting password after OTP verification
export const changePassword = async (email, otp, newPassword) => {
  
  try {
    const response = await apiClient.post('reset-password/', {
      token: email,
      password: newPassword,
      otp: otp,
    });

    
    return response.data;
  } catch (error) {
    console.error('[ResetPassword] Error:', error.response?.data || error.message);

    throw {
      message: error.response?.data?.error || 'Error changing password.',
      response: error.response?.data,
    };
  }
};

// -------------------------------------------------------------------
// Fetch Exercise from backend
// -------------------------------------------------------------------

// Function to check if an exercise is in the favorites


export const checkFavoriteStatus = async (exerciseName) => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await apiClient.post(`toggle-favorite/?action=check`, { exercise_name: exerciseName }, {
      headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
    });
    return response.data.is_favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

export const toggleFavoriteStatus = async (exerciseName) => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await apiClient.post('toggle-favorite/?action=toggle', { exercise_name: exerciseName }, {
      headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
    });
    return response.data.message;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};

export const getFavoriteExercises = async () => {
  try {
    const token = await getAuthToken();
    console.log(token);
    const response = await apiClient.get('/favorites/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite exercises:', error);
    throw error;
  }
};

export const addToFavorites = async (exerciseId) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.post(
      '/favorites/',
      { exercise_id: exerciseId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (favoriteId) => {
  try {
    const token = await getAuthToken();
    console.log(token);
    const response = await apiClient.delete(`/favorites/${favoriteId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};


export const fetchExercises = async (selectedCategory, selectedEquipment, searchQuery, page = 1, limit = 20) => {
  try {
    // Log the parameters being sent to the API
    console.log('Fetching exercises with parameters:', {
      selectedCategory,
      selectedEquipment,
      searchQuery,
      page,
      limit
    });

    const params = {
      page,  // Enables pagination
      limit, // Restricts number of exercises fetched
    };

    if (selectedCategory) params.category = selectedCategory;
    if (selectedEquipment) params.equipment = selectedEquipment;
    if (searchQuery) params.search = searchQuery;

    console.log('API request parameters:', params);  // Log the request parameters
    
    const response = await apiClient.get('exercises/', { params });

    // Log the response data
    console.log('Exercises fetched successfully:', response.data);

    return response.data;  // Returns paginated results

  } catch (error) {
    // Log error details for debugging
    if (error.response) {
      console.error('Error fetching exercises:', error.response.data);
    } else {
      console.error('Error fetching exercises:', error.message);
    }

    return { error: 'Failed to load exercises. Please try again later.' };
  }
};



export const fetchCalorieProgress = async () => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await apiClient.get('progress/summary/',{
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the headers
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch progress summary:', error);
    throw error;
  }
};

export const fetchExerciseProgress = async () => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await apiClient.get('progress/exercise/',{
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the headers
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch exercise progress:', error);
    throw error;
  }
};

export const fetchProgressData = async (period, date, week) => {
  try {
    const token = await getAuthToken();
    let url = `visualization/?period=${period}`;
    if (date) url += `&date=${date}`;           // date in "YYYY-MM-DD"
    if (week) url += `&week=${week}`;           // week as a number string "1", "2", etc.

    const response = await apiClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  } catch (error) {
    console.error('Error fetching progress data:', error);
    throw error;
  }
};



export async function fetchWorkoutStats() {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await fetch(`${API_BASE_URL}workout-stats/`, {
      method: 'GET',
      headers: {
        
        Authorization: `Bearer ${token}`,  // if you use token auth
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workout stats');
    }

    const data = await response.json();
    
    return data; // { workouts_completed, workout_streak, avg_workout_duration }
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    throw error;
  }
}

export const startExercise = async (exerciseData) => {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      throw new Error('No valid token found. Please log in again.');
    }

    const response = await apiClient.post('start-exercise/', exerciseData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Start Exercise Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in startExercise:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to start exercise' };
  }
};

export const cancelExerciseSession = async (workoutExerciseId) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}cancel-exercise/${workoutExerciseId}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to cancel exercise session.');
  }

  return await response.json();
};


// Function to end an exercise session
export const endExerciseSession = async (Exercise_Id, totalTime, userToken, calories) => {
  try {
    if (!userToken) {
      throw new Error('User is not authenticated');
    }

    const response = await apiClient.post(
      'end-exercise/',
      {
        workout_exercise_id: Exercise_Id,
        total_time_seconds: totalTime, // Ensure it's in seconds
        calories_burned: calories,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    console.log('End Exercise Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error ending exercise:', error.response?.data || error.message);
    throw error;
  }
};

// Function to log sets and reps
export const logExercisePerformance = async (Exercise_Id, set_data, userToken) => {
  try {
    if (!userToken) {
      throw new Error('User is not authenticated');
    }

    const response = await apiClient.post(
      'log-exercise-performance/',
      {
        workout_exercise_id: Exercise_Id,
        sets: set_data.map((set, index) => ({
          set_number: index + 1,
          reps: parseInt(set.reps, 10), // Ensure integer
          weight: parseFloat(set.weight), // Ensure float
        })),
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    console.log('Log Performance Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging performance:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchRecommendedExercises = async() =>{
  try{
    const token = await getAuthToken();
    const response = await apiClient.get('recommend-exercise/',{
      headers:{
        Authorization:`Bearer ${token}`,
      },
    });
    return response.data;
    console.log("Recommendation",response.data);
  }catch(error){
      console.error("Error fetching",error.response?.data||error.message);
      throw error;
  }

};


// ------------------------------
// Workout Library Endpoints
// ------------------------------

// **Create Workout Library**
export const createWorkoutLibrary = async (libraryData) => {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      throw new Error('No valid token found. Please log in again.');
    }

    const response = await apiClient.post('workout-libraries/create/', libraryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Create Library Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createWorkoutLibrary:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create workout library' };
  }
};

// **Get Workout Libraries**
export const getWorkoutLibraries = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      throw new Error('No valid token found. Please log in again.');
    }

    const response = await apiClient.get('workout-libraries/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Get Libraries Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getWorkoutLibraries:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch workout libraries' };
  }
};

// **Delete Workout Library**
export const deleteWorkoutLibrary = async (libraryId) => {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      throw new Error('No valid token found. Please log in again.');
    }

    const response = await apiClient.delete(`workout-libraries/${libraryId}/delete/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Delete Library Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteWorkoutLibrary:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete workout library' };
  }
};

// ------------------------------
// Workout Library Exercise Endpoints
// ------------------------------

// **Add Exercise to Library**
export const addExerciseToLibrary = async (libraryId, exerciseData) => {
  const token = await AsyncStorage.getItem('access_token');
  const updatedExerciseData = {
    ...exerciseData,
    workout_exercise_id: exerciseData.id,  // Map 'id' to 'workout_exercise_id'
    body_part: exerciseData.bodyPart,  // Map 'bodyPart' to 'body_part'
  };

  const requiredFields = ['workout_exercise_id', 'name', 'body_part'];
  for (let field of requiredFields) {
    if (!updatedExerciseData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}workout-libraries/${libraryId}/exercises/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedExerciseData),
    });

    const text = await response.text();  // Get raw response as text

    let data;
    try {
      data = JSON.parse(text);  // Attempt to parse the response as JSON
    } catch (e) {
      console.error("Invalid JSON response:", text);  // Log invalid response
      throw new Error('Failed to parse response as JSON');
    }

    console.log('Add Exercise Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add exercise to library');
    }
    return data;
  } catch (error) {
    console.error('Error adding exercise to library:', error);
    throw error;  // Rethrow the error after logging it
  }
};

// **Get Library Exercises**
export const getLibraryExercises = async (libraryId) => {
  const token = await AsyncStorage.getItem('access_token');
  
  try {
    const response = await fetch(`${API_BASE_URL}workout-libraries/${libraryId}/exercises/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text(); // Get error message as text if it's not JSON
      console.error('Error response:', errorMessage);
      throw new Error(`Failed to fetch exercises: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched Library Exercises:', data);
    return data;
  } catch (error) {
    console.error('Error in getLibraryExercises:', error);
    throw error;
  }
};

// **Delete Exercise from Library**
export const deleteLibraryExercise = async (libraryId, exerciseId) => {
  const token = await AsyncStorage.getItem('access_token');

  try {
    const response = await fetch(`${API_BASE_URL}workout-libraries/${libraryId}/exercises/${exerciseId}/delete/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Delete Library Exercise Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete exercise from library');
    }
    return data;
  } catch (error) {
    console.error('Error in deleteLibraryExercise:', error);
    throw error;
  }
};


import { fetchData, exerciseOptions } from '../utils/ExerciseFetcher';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export const getExerciseDetailsByName = async (exerciseName, authToken) => {
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(exerciseName)}`;
  const options = {
    ...exerciseOptions,
    headers: {
      ...exerciseOptions.headers,
      Authorization: `Bearer ${authToken}`,
    },
  };

  const data = await fetchData(url, options);
  if (data && data.length > 0) {
    return data[0]; // Assuming the API returns an array and we take the first result
  }
  throw new Error('Exercise details not found');
};


export const fetchWorkoutDates = async () => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await apiClient.get('/workout-dates/', {
      headers: {
        Authorization: `Bearer ${token}`, // Include the authentication token
      },
    });
    return response.data; // Returns an array of dates
  } catch (error) {
    console.error('Error fetching workout dates:', error);
    throw error;
  }
};
// *----------
// Nutrition API Calls
// -----------*

export const saveMealPlanToBackend = async (mealPlan) => {
  try {
    const token = await getAuthToken(); // Get the authentication token

    // Format the mealPlan to match the API's expected structure
    const formattedMealPlan = mealPlan.map((meal) => ({
      meal: meal.meal, // Meal type (e.g., Breakfast, Lunch)
      name: meal.suggestions[0]?.name || 'Unknown Meal', // Extract the name from the first suggestion
      ingredients: meal.suggestions[0]?.ingredients || [], // Extract ingredients from the first suggestion
      calories: meal.suggestions[0]?.calories || 0, // Extract calories from the first suggestion
      dietary_restriction: meal.dietary_restriction || 'None', // Default dietary restriction
      is_consumed: meal.is_consumed || false, // Default consumption status
    }));

    // Make the API call
    const response = await apiClient.post(
      'meal-plans/create/',
      { mealPlan: formattedMealPlan }, // Send the formatted meal plan
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the authentication token
        },
      }
    );

    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.error('Duplicate meal plan detected:', error.response.data);
    } else {
      console.error('Error saving meal plan:', error);
    }
  }
};

export const bulkUpdateMealConsumedStatus = async (updates) => {
  try {
    const token = await getAuthToken(); // Get the authentication token

    console.log('Payload sent to backend:', updates); // Log the updates payload

    const response = await apiClient.patch(
      'meal-plans/bulk-update-consumed/',
      { updates },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the authentication token
        },
      }
    );

    console.log('Meal statuses updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating meal statuses:', error.response?.data || error.message);
    throw error;
  }
};


export const fetchMealPlan = async () => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get('meal-plans/', {
      headers: {
        Authorization: `Bearer ${token}`, // Include the authentication token
      },
    });

    // Map the response data to include the required fields
    const fetchedMealPlan = response.data.map((meal) => ({
      id: meal.id, // Ensure the ID is included
      name: meal.name,
      meal: meal.meal,
      suggestions: meal.suggestions,
      is_consumed: meal.is_consumed,
    }));

    return fetchedMealPlan; // Return the formatted meal plan
  } catch (error) {
    console.error('Error fetching meal plan:', error.response?.data || error.message);
    throw error; // Throw the error to handle it in the calling function
  }
};

export const fetchDailysSummary = async () => {
  const token = await getAuthToken(); // or from storage/context
  const response = await axios.get(`${API_BASE_URL}daily-summary/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


export const fetchBackendMeals = async () => {
  try {
    const token = await getAuthToken();
    const today = new Date().toISOString().split('T')[0];

    const response = await apiClient.get(`backend-meals/?start_date=${today}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const rawMeals = response.data;

    // 🔄 Convert to expected format with suggestions[]
    const formattedMealPlan = rawMeals.map(meal => ({
      meal: meal.meal,
      suggestions: [{
        name: meal.name,
        ingredients: meal.ingredients || [],
        calories: meal.calories || 0
      }],
      is_consumed: meal.is_consumed,
      dietary_restriction: meal.dietary_restriction || 'None',
      id: meal.id || null, // Ensure ID is included for updates
    }));

    console.log('Formatted Backend Meals:', formattedMealPlan);
    return formattedMealPlan;

  } catch (error) {
    console.error('Error fetching backend meals:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchBackendMealsInRange = async (startDate, endDate) => {
  try {
    const token = await getAuthToken();

    const response = await apiClient.get(
      `/meal-plans/range/?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const rawMeals = response.data;

    return rawMeals;

  } catch (error) {
    console.error('Error fetching backend meals in range:', error.response?.data || error.message);
    throw error;
  }
};



export const fetchRecommendedMeals = async () => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_BASE_URL}recommended-meals/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Create a new pose session
export const createPoseSession = async (poseType) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}pose-session/`,
      { pose_type: poseType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
  } catch (error) {
    console.error('Session creation failed:', error.response?.data || error.message);
    Alert.alert('Error', 'Could not start pose session');
  }
};

// Submit pose feedback
export const sendPoseFeedback = async (feedbackData) => {
  const token = await getAuthToken();
  const response = await axios.post(
    `${API_BASE_URL}pose-feedback/`,
    feedbackData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Mark a session as completed
export const completePoseSession = async (sessionId) => {
  const token = await getAuthToken();
  const response = await axios.post(
    `${API_BASE_URL}pose-session/${sessionId}/complete/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


export const getCaloriesByPose = async (startDate, endDate) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${API_BASE_URL}calories-by-pose/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );

    // Log response data as formatted JSON
    console.log('Calories by pose data:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    return { data: [] }; // return consistent JSON structure to avoid crashing UI
  }
};


export const fetchMealHistory = async () => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const response = await fetch(`${API_BASE_URL}meals/history/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // For JWT-based auth
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch meal history: ${response.status}`);
    }

    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching meal history:', error);
    return [];
  }
}

export const fetchDailyFitnessSummary = async (date = null) => {
  try {
    const token = await getAuthToken(); // Get the authentication token
    const query = date ? `?date=${date}` : '';
    const response = await fetch(`${API_BASE_URL}fitness-summary/${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch fitness summary: ${response.status}`);
    }

    const data = await response.json();
    return {
      date: data.date,
      caloriesBurned: data.calories_burned,
      caloriesConsumed: data.calories_consumed,
      netCalories: data.net_calories,
      poseSets: data.pose_sets,
    };
  } catch (error) {
    console.error('Error fetching fitness summary:', error);
    return {
      date: null,
      caloriesBurned: 0,
      caloriesConsumed: 0,
      netCalories: 0,
      poseSets: [],
    };
  }
};
