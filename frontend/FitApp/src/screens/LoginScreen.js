import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from '../api/axios';

const LoginScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async () => {
        try {
            const response = await axios.post('login/', formData);
            console.log(response.data);
            Alert.alert('Success', 'Login successful!');
        } catch (error) {
            console.error(error.response?.data || error.message);
            Alert.alert('Error', 'Login failed!');
        }
    };

    return (
        <View style={styles.container}>
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
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default LoginScreen;
