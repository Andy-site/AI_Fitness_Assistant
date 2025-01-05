import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from '../api/axios';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        email: '',
        password1: '',
        password2: '',
        name: '',
        age: '',
        height: '',
        weight: '',
        goal: '',
    });

    const handleRegister = async () => {
        try {
            const response = await axios.post('registration/', {
                username: formData.email,  // Use email as username
                password1: formData.password1,
                password2: formData.password2,
                email: formData.email,
            });
            console.log(response.data);
            Alert.alert('Success', 'Registration successful!');
            navigation.navigate('Login');
        } catch (error) {
            console.error(error.response?.data || error.message);
            Alert.alert('Error', 'Registration failed! Check your input and try again.');
        }
    };
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                placeholder="Email"
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={formData.password1}
                onChangeText={(text) => setFormData({ ...formData, password1: text })}
            />
            <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                value={formData.password2}
                onChangeText={(text) => setFormData({ ...formData, password2: text })}
            />
            <TextInput
                placeholder="Name"
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
                placeholder="Age"
                style={styles.input}
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
            />
            <TextInput
                placeholder="Height (e.g., 5.9)"
                style={styles.input}
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
            />
            <TextInput
                placeholder="Weight (e.g., 70.5)"
                style={styles.input}
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
            />
            <TextInput
                placeholder="Goal (e.g., Build Muscle)"
                style={styles.input}
                value={formData.goal}
                onChangeText={(text) => setFormData({ ...formData, goal: text })}
            />
            <Button title="Register" onPress={handleRegister} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default RegisterScreen;
