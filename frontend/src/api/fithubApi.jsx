import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.117:8000/api'; // Replace with your actual server IP and port

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// API call for registering the user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'An error occurred during registration.' };
  }
};

// API call for logging in and getting JWT token
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/login/', { email, password });
    // Save the JWT token in AsyncStorage
    const { access } = response.data;
    await AsyncStorage.setItem('jwt_token', access);  // Consistent key
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Invalid email or password.' };
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
    const response = await apiClient.post('/send-otp/', { email });
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Error sending OTP.' };
  }
};

// API call for verifying the OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await apiClient.post('/verify-otp/', { email, otp });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Invalid OTP or an error occurred.' };
  }
};




// API call for sending a password reset token
export const forgotPasswordRequest = async (email) => {
  try {
    const response = await apiClient.post('/forgot-password/otp/', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to send OTP for password reset.' };
  }
};

// API call for resetting password after OTP verification
export const changePassword = async (email, otp, newPassword) => {
  try {
    const response = await apiClient.post('/reset-password/', {
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
    const response = await apiClient.post('/forgot-password/verify/', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify OTP' };
  }
};




// Function to end exercise session
export const endExerciseSession = async (workoutExerciseId, totalTime, userToken, calories) => {
  try {
    if (!userToken) {
      throw new Error('User is not authenticated');
    }

    // Proceed with the API request
    const response = await apiClient.post(
      '/api/end-exercise/',  // Updated endpoint
      {
        workout_exercise_id: workoutExerciseId,
        total_time_seconds: totalTime, // Already in seconds, no need to multiply
        calories_burned: calories,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error ending exercise:', error);
    throw error;
  }
};

// Function to log sets and reps
export const logExercisePerformance = async (workoutExerciseId, sets, userToken) => {
  try {
    if (!userToken) {
      throw new Error('User is not authenticated');
    }

    // Filter out empty sets
    const validSets = sets.filter(set => set.weight && set.reps);

    // Proceed with the API request
    const response = await apiClient.post(
      '/api/log-exercise-performance/',  // Updated endpoint
      {
        workout_exercise_id: workoutExerciseId,
        sets: validSets.map((set, index) => ({
          set_number: index + 1,
          reps: parseInt(set.reps),
          weight: parseFloat(set.weight),
        })),
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    return response.data;
  } catch (error) {
    console.error('Error logging performance:', error);
    throw error;
  }
};

export const startExerciseSession = async (exercise, setWorkoutExerciseId, setStartTime) => {
  try {
    // Retrieve the JWT token from AsyncStorage
    const userToken = await AsyncStorage.getItem('jwt_token');
    
    if (!userToken) {
      throw new Error('User is not authenticated');
    }

    // Proceed with the API request
    const response = await apiClient.post(
      '/api/start-exercise/',
      {
        exercise_name: exercise.name,
        body_part: exercise.bodyPart
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );

    // Debug log
    console.log('Start exercise response:', response.data);

    // Verify the response contains the expected data
    if (!response.data || !response.data.workout_exercise_id) {
      throw new Error('Invalid response from server: missing workout_exercise_id');
    }

    // Update the state using the provided setters
    setWorkoutExerciseId(response.data.workout_exercise_id);
    if (setStartTime && response.data.start_time) {
      setStartTime(response.data.start_time);
    }

    // Return the response data for the caller
    return response.data;
  } catch (error) {
    console.error('Error in startExerciseSession:', error);
    throw error;
  }
};

