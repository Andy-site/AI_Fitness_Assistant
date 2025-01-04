import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://192.168.0.117:8000/api/FitHub/', // Replace with your Django API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/register/', userData);
        return response.data; // You can handle the response as needed
    } catch (error) {
        console.error('Registration error:', error.response || error);
        throw new Error('Registration failed!');
    }
};
