import axios from 'axios';

// Define the base URL for your API
const API_BASE_URL = 'http://192.168.0.117:8000/api'; // Replace with your actual server IP and port

/**
 * Registers a new user by sending user data to the backend.
 * 
 * @param {Object} userData - The user data object containing:
 *   {string} email - User's email address.
 *   {string} password - User's password.
 *   {string} first_name - User's first name.
 *   {string} last_name - User's last name.
 *   {number} age - User's age (as an integer).
 *   {number} height - User's height (as a float).
 *   {number} weight - User's weight (as a float).
 *   {string} goal - User's fitness goal.
 * 
 * @returns {Promise<Object>} - The API response if the request is successful.
 * @throws {Error} - Throws an error if the API call fails or returns an error response.
 */
export const registerUser = async (userData) => {
    try {
        // Log the data being sent for debugging purposes
        console.log('Sending Registration Data:', userData);

        // Make a POST request to the register endpoint
        const response = await axios.post(`${API_BASE_URL}/register/`, userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // If the API returns a success flag, return the data
        if (response.status === 201 || response.data.success) {
            console.log('Registration Successful:', response.data);
            return response.data;
        } else {
            // Handle cases where the server responds but doesn't indicate success
            console.error('Registration Failed:', response.data);
            throw new Error(response.data.message || 'Registration failed');
        }
    } catch (error) {
        // Log error details for debugging
        if (error.response) {
            // Backend responded with a status code other than 2xx
            console.error('Backend Error:', error.response.data);
            throw new Error(error.response.data.message || 'An error occurred during registration.');
        } else if (error.request) {
            // Request was sent but no response was received
            console.error('No Response from Backend:', error.request);
            throw new Error('No response from the server. Please try again later.');
        } else {
            // Something else caused the error
            console.error('Unexpected Error:', error.message);
            throw new Error(error.message || 'An unknown error occurred.');
        }
    }
};
