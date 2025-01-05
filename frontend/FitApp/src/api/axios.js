import axios from "axios";


const instance = axios.create({
    baseURL: 'http://192.168.0.117:8000/auth/',  // Make sure this is the correct backend URL
});

export const registerUser = async (userData) => {
    try {
        // Make sure this is a POST request for registration
        const response = await instance.post('registration/', userData);  // Correct endpoint
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response || error);
        throw new Error('Registration failed!');
    }
};


