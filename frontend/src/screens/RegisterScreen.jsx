import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';

const RegisterScreen = ({ route }) => {
    // Destructuring safely with a fallback to prevent errors
    const { email, password, name, age, height, weight, goal } = route.params || {};

    const handleRegister = () => {
        Alert.alert('Registration Complete', `Welcome, ${name}!`);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Text>Email: {email}</Text>
            <Text>Password: {password}</Text>
            <Text>Name: {name}</Text>
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
