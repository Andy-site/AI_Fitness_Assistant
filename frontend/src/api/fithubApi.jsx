import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.117:8000/api';  // Update with your server URL

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register/`, userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Check if response indicates success
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
