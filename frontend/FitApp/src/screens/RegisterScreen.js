import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { registerUser } from './api/fitHubApi';

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
        if (!formData.goal || formData.goal === 'Select Goal') {
            Alert.alert('Error', 'Please select a valid goal.');
            return;
        }

        if (formData.password1 !== formData.password2) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (isNaN(formData.age) || isNaN(formData.height) || isNaN(formData.weight)) {
            Alert.alert('Error', 'Please enter valid numeric values for age, height, and weight.');
            return;
        }

        try {
            const response = await registerUser(formData);
            Alert.alert('Success', 'Registration successful!');
            navigation.navigate('Login');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed! Check your input and try again.';
            Alert.alert('Error', errorMsg);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Register</Text>

            <TextInput
                placeholder="Email"
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                accessibilityLabel="Enter your email"
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={formData.password1}
                onChangeText={(text) => setFormData({ ...formData, password1: text })}
                accessibilityLabel="Enter your password"
            />
            <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                value={formData.password2}
                onChangeText={(text) => setFormData({ ...formData, password2: text })}
                accessibilityLabel="Re-enter your password to confirm"
            />
            <TextInput
                placeholder="Name"
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                accessibilityLabel="Enter your full name"
            />
            <TextInput
                placeholder="Age"
                style={styles.input}
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                accessibilityLabel="Enter your age"
            />
            <TextInput
                placeholder="Height (e.g., 5.9)"
                style={styles.input}
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
                accessibilityLabel="Enter your height in feet or meters"
            />
            <TextInput
                placeholder="Weight (e.g., 70.5)"
                style={styles.input}
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                accessibilityLabel="Enter your weight in kilograms"
            />

            {/* Dropdown for Goal Selection */}
            <SelectDropdown
                data={['Weight Loss', 'Weight Gain']}
                onSelect={(selectedItem) => {
                    setFormData((prevData) => ({ ...prevData, goal: selectedItem }));
                }}
                defaultButtonText="Select Goal"
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
            />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
    dropdownButton: {
        borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#ffffff',
    },
    dropdownButtonText: { color: '#000' },
    registerButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    registerButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});

export default RegisterScreen;
