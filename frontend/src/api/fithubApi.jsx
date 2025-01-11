import axios from 'axios';

// Define the base URL for your API
const API_BASE_URL = 'http://192.168.0.117:8000/api'; // Replace with your actual server IP and port

export const registerUser = async (userData) => {
    try {
        // Make a POST request to the register endpoint
        const response = await axios.post(`${API_BASE_URL}/register/`, userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Return the response data if registration is successful
        return response.data;
    } catch (error) {
        // Throw a generic error if anything goes wrong
        throw new Error('An error occurred during registration.');
    }
};
