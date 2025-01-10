// api/fithubApi.js

const API_BASE_URL = 'http://10.0.2.2:8000/api';  // Update with your server URL

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};