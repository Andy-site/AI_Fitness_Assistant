import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/register/'; // Replace with your actual API URL

export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
