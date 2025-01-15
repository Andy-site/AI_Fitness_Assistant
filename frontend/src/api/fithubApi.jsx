import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.117:8000/api'; // Replace with your actual server IP and port

// API call for registering the user
export const registerUser = async (userData) => {
    console.log('Registering user with data:', userData); // Debug log
    try {
        const response = await axios.post(`${API_BASE_URL}/register/`, userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Register response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Register error:', error.response?.data || error.message); // Debug log
        throw error.response?.data || { message: 'An error occurred during registration.' };
    }
};

// API call for sending OTP to the user's email
export const sendOtp = async (email) => {
    console.log('Sending OTP to email:', email); // Debug log
    try {
        const response = await axios.post(`${API_BASE_URL}/send-otp/`, { email }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Send OTP response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Send OTP error:', error.response?.data || error.message); // Debug log
        throw error.response?.data || { message: 'Error sending OTP.' };
    }
};

// API call for verifying the OTP
export const verifyOtp = async (otp, email) => {
    console.log('Verifying OTP for email:', email); // Debug log
    try {
        const response = await axios.post(`${API_BASE_URL}/verify-otp/`, { otp, email }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Verify OTP response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Verify OTP error:', error.response?.data || error.message); // Debug log
        throw error.response?.data || { message: 'Invalid OTP or an error occurred.' };
    }
};

// API call for logging in and getting JWT token
export const loginUser = async (email, password) => {
    console.log('Logging in user with email:', email); // Debug log
    try {
        const response = await axios.post(`${API_BASE_URL}/login/`, {
            email,
            password,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Login response:', response.data); // Debug log
        return response.data; // Returns access and refresh tokens
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message); // Debug log
        throw error.response?.data || { message: 'Invalid email or password.' };
    }
};

// API call for sending a password reset token
export const forgotPasswordRequest = async (email) => {
    console.log('Requesting password reset for email:', email); // Debug log
    try {
        const response = await axios.post(`${API_BASE_URL}/forgot-password/`, { email }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Forgot password response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Forgot password error:', error.response?.data || error.message); // Debug log
        throw error.response?.data || { message: 'Failed to send password reset email.' };
    }
};


// api/fithubApi.js
export const changePassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reset-password/`, 
        {
          token: email,       // Send the email address explicitly
          password: newPassword, // New password to be set
          otp: otp,           // Pass OTP as expected by the backend
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        message: error.response?.data?.error || 'Error changing password.',
        response: error.response?.data,
      };
    }
  };
  

// fithubApi.js
export const requestPasswordResetOTP = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password/otp/`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send OTP' };
    }
  };
  
  export const verifyPasswordResetOTP = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password/verify/`, { 
        email, 
        otp 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify OTP' };
    }
  };