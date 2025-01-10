import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/register/'; // Replace with your actual API URL

export const registerUser = async (formData) => {
    console.log('Sending registration data to backend:', formData); // Log the data

    try {
        const response = await axios.post(API_URL, formData);
        console.log('Backend response:', response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error('Error during registration API call:', error); // Log the error
        throw error;
    }
};
