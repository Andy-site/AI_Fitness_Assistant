import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { registerUser } from '../api/fithubApi';

const RegisterScreen = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        age: '',
        height: '',
        weight: '',
        goal: '',
    });

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = async () => {
        // Simple form validation (ensure all fields are filled)
        const { username, email, password, age, height, weight, goal } = form;
        if (!username || !email || !password || !age || !height || !weight || !goal) {
            Alert.alert('Validation Error', 'All fields are required!');
            return;
        }

        try {
            const userData = { ...form }; // Prepare data for sending
            const response = await registerUser(userData);
            Alert.alert('Success', 'User registered successfully!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Registration failed. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            {Object.keys(form).map((field) => (
                <TextInput
                    key={field}
                    value={form[field]}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    style={styles.input}
                    onChangeText={(value) => handleChange(field, value)}
                    secureTextEntry={field === 'password'} // Secure input for password
                />
            ))}
            <Button title="Register" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, justifyContent: 'center' },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        marginVertical: 10,
        paddingHorizontal: 10,
        height: 40,
    },
});

export default RegisterScreen;
