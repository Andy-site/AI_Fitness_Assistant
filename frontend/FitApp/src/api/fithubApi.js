import instance from './axios'; // Import the generic Axios instance

export const registerUser = async (userData) => {
    try {
        const response = await instance.post('/api/register/', userData); // Ensure correct endpoint
        return response.data; // Handle response as needed
    } catch (error) {
        console.error('Registration error:', error.response || error);
        throw new Error('Registration failed!');
    }
};

export default {
    registerUser,
};
