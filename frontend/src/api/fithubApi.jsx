import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.117:8000/api/'; // Replace with your actual server IP and port
// const API_BASE_URL = 'http://192.168.64.1:8000/api/'; // Replace with your actual server IP and port

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
  

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    // Log the full response for debugging
    const text = await response.text();
    const data = JSON.parse(text);
    console.log(data);
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to log in');
    }

    return data; // { access, refresh }
  } catch (error) {
    throw error;
  }
};

// API call for updating the user profile
export const updateUserProfile = async (userData, profileImage) => {
  
  try {
    const token = await getAuthToken();

    if (!API_BASE_URL) {
      throw new Error("API_BASE_URL is not defined. Check your config.");
    }

    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Updating profile at:', `${API_BASE_URL}profile/update/`);
    console.log('User Data:', userData);
    console.log('Profile Image:', profileImage);

    const formData = new FormData();
    formData.append('first_name', userData.first_name);
    formData.append('last_name', userData.last_name);
    formData.append('age', userData.age.toString());
    formData.append('height', userData.height.toString());
    formData.append('weight', userData.weight.toString());
    formData.append('goal', userData.goal);

    if (profileImage) {
      formData.append('profile_photo', {
        uri: profileImage.uri,
        type: profileImage.type || 'image/jpeg',
        name: profileImage.fileName || 'profile.jpg',
      });
    }

    const response = await fetch(`${API_BASE_URL}profile/update/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Remove 'Content-Type' for FormData (it will be auto-set)
      },
      body: formData,
    });

    const text = await response.text();
    console.log('Raw response:', text);

    try {
      const data = JSON.parse(text);
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }

      console.log('Profile updated successfully:', data);
      return data;
    } catch (jsonError) {
      throw new Error('Server response is not valid JSON: ' + text);
    }

  } catch (error) {
    console.error('Update Profile error:', error.message);
    throw new Error(error.message || 'An error occurred while updating the profile.');
  }
};


// Function to get the token from AsyncStorage
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');  // Consistent key for token
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};


// API call for sending OTP to the user's email
export const sendOtp = async (email) => {
  try {
    const response = await apiClient.post('send-otp/', { email });
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Error sending OTP.' };
  }
};

// API call for verifying the OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await apiClient.post('verify-otp/', { email, otp });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Invalid OTP or an error occurred.' };
  }
};

export const fetchUserDetails = async () => {
  const API_BASE_URL = 'http://192.168.0.117:8000/'; 
  // const API_BASE_URL = 'http://192.168.64.1:8000/api/'; 
  try {
    const token = await AsyncStorage.getItem('access_token');
    console.log('Stored token:', token);
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_BASE_URL}api/user-details/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the token
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }

    const user = await response.json(); // Parse JSON response
    await AsyncStorage.setItem('user_details', JSON.stringify(user)); // Store user details

    return user;
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw error;
  }
};


// API call for sending a password reset token
export const forgotPasswordRequest = async (email) => {
  try {
    const response = await apiClient.post('forgot-password/otp/', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to send OTP for password reset.' };
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
    console.error('API Error:', error.response?.data || error.message);
    throw {
      message: error.response?.data?.error || 'Error changing password.',
      response: error.response?.data,
    };
  }
};

// API call for verifying OTP before password reset
export const verifyPasswordResetOTP = async (email, otp) => {
  try {
    const response = await apiClient.post('forgot-password/verify/', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify OTP' };
  }
};


export const startExercise = async (exerciseData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}start-exercise/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(exerciseData),
    });

    const data = await response.json();
    console.log('Start Exercise Response:', data); // Debugging log

    if (!response.ok) {
      throw new Error(data.error || 'Failed to start exercise');
    }
    return data;
  } catch (error) {
    console.error('Error in startExercise:', error);
    throw error;
  }
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


// ------------------------------
// Workout Library Endpoints
// ------------------------------

export const createWorkoutLibrary = async (libraryData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}libraries/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(libraryData),
    });

    const data = await response.json();
    console.log('Create Library Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create workout library');
    }
    return data;
  } catch (error) {
    console.error('Error in createWorkoutLibrary:', error);
    throw error;
  }
};

export const getWorkoutLibraries = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}libraries/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Get Libraries Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch workout libraries');
    }
    return data;
  } catch (error) {
    console.error('Error in getWorkoutLibraries:', error);
    throw error;
  }
};

export const deleteWorkoutLibrary = async (libraryId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}libraries/${libraryId}/delete/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Delete Library Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete workout library');
    }
    return data;
  } catch (error) {
    console.error('Error in deleteWorkoutLibrary:', error);
    throw error;
  }
};

// ------------------------------
// Workout Library Exercise Endpoints
// ------------------------------

export const addExerciseToLibrary = async (libraryId, exerciseData, token) => {
  // Map the 'id' field to 'workout_exercise_id'
  const updatedExerciseData = {
    ...exerciseData,
    workout_exercise_id: exerciseData.id,  // Use 'id' as 'workout_exercise_id'
    body_part: exerciseData.bodyPart,  // Convert 'bodyPart' to 'body_part'
  };

  // Ensure exerciseData contains the required fields
  const requiredFields = ['workout_exercise_id', 'name', 'body_part'];
  for (let field of requiredFields) {
    if (!updatedExerciseData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}libraries/${libraryId}/exercises/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedExerciseData),
    });

    const text = await response.text();  // Get raw response as text

    // Check if response is JSON before parsing
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




export const getLibraryExercises = async (libraryId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}libraries/${libraryId}/exercises/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Log and throw an error if the response is not OK
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


export const deleteLibraryExercise = async (libraryId, exerciseId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}libraries/${libraryId}/exercises/${exerciseId}/delete/`, {
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
