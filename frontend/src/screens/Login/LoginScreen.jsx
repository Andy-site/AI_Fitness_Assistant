import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput'; // Import the PasswordInput component
import NextButton from '../../components/NextButton';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Add AsyncStorage for JWT storage
import { loginUser } from '../../api/fithubApi'; // Import the loginUser function

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);


// In your handleSubmit method
const handleSubmit = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Validation Error', 'Please enter both email and password.');
    return;
  }

  try {
    console.log('Login data:', { email, password });

    // Call the loginUser API function from api.js
    const response = await loginUser(email, password);
    console.log('Login response:', response);

    if (!response || !response.access) {
      throw new Error('No access token received');
    }

    // Store the JWT token securely using AsyncStorage
    await AsyncStorage.setItem('jwt_token', response.access);

    // Now fetch the user details using the JWT token
    const userResponse = await fetchUserDetails(response.access);
    console.log('User details:', userResponse);

    if (!userResponse) {
      throw new Error('Failed to fetch user details');
    }

    // Store the user details in AsyncStorage
    await AsyncStorage.setItem('user_details', JSON.stringify(userResponse));

    // Navigate to the HomeScreen after successful login
    navigation.navigate('Home');
  } catch (err) {
    console.error('Login error:', err);
    setError('Invalid email or password');
    Alert.alert('Error', err.message || 'An error occurred during login.');
  }
};

const fetchUserDetails = async (accessToken) => {
  try {
    console.log('Access Token:', accessToken);  // Log token for debugging

    // const response = await fetch('http://192.168.0.117:8000/api/user-details/', {
    const response = await fetch('http://192.168.64.1:8000/api/user-details/', {

      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',  // Ensure content type is set
      },
    });

    const text = await response.text();
    console.log('Raw response:', text);

    if (!response.ok) {
      const errorData = JSON.parse(text); // Capture error details
      throw new Error(errorData.detail || 'Failed to fetch user details');
    }

    // Parse the response if it's valid JSON
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};





  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View style={styles.purpleBackground}>
        <Text style={styles.label}>Email</Text>
        <InputField
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.separator} />
        
        <Text style={styles.label}>Password</Text>
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword1')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <NextButton title="Log In" onPress={handleSubmit} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don’t have an account?{' '}
          <TouchableOpacity onPress={() => navigation.navigate('Email')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000', // Black background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for contrast
    marginBottom: 20,
    textAlign: 'center',
  },
  purpleBackground: {
    backgroundColor: '#B3A0FF', // Purple background for the input container
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#232323',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#D1C4E9', // Light purple separator line
    marginVertical: 10,
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 10,
    fontWeight: 450,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  link: {
    color: '#E2F163',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
