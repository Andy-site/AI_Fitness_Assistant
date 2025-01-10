import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { registerUser } from '../api/fithubApi';

const RegisterScreen = ({ route }) => {
    // Destructuring safely with a fallback to prevent errors
    const { email, password, firstName, lastName, age, height, weight, goal } = route.params || {};

    const handleRegister = async () => {
        // Log the data being sent
        console.log('Registration Data:', { email, password, firstName, lastName, age, height, weight, goal });

        try {
            const response = await registerUser({ email, password, firstName, lastName, age, height, weight, goal });
            console.log('Registration Response:', response);
            if (response && response.success) {
                Alert.alert('Registration Complete', `Welcome, ${firstName} ${lastName}!`);
            } else {
                Alert.alert('Registration Failed', 'Please try again.');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Registration Failed', 'Something went wrong.');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Text>Email: {email}</Text>
            <Text>Password: {password}</Text>
            <Text>First Name: {firstName}</Text>
            <Text>Last Name: {lastName}</Text>
            <Text>Age: {age}</Text>
            <Text>Height: {height}</Text>
            <Text>Weight: {weight}</Text>
            <Text>Goal: {goal}</Text>
            <Button title="Complete Registration" onPress={handleRegister} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default RegisterScreen;
