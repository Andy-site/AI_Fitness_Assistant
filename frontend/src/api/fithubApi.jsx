import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.117:8000/api'; // Replace with your actual server IP and port

// API call for registering the user and sending OTP
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
        throw new Error('An error occurred during registration.');
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
        throw new Error('Error sending OTP.');
    }
};


export const verifyOtp = async (otp, email) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/verify-otp/`, { otp, email }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        throw new Error('Invalid OTP or an error occurred.');
    }
};

