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

    // Store the JWT token securely using AsyncStorage
    await AsyncStorage.setItem('jwt_token', response.access);

    // Navigate to the HomeScreen after successful login
    navigation.navigate('HomeScreen'); 
  } catch (err) {
    console.error('Login error:', err);
    setError('Invalid email or password');
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

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <NextButton title="Log In" onPress={handleSubmit} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don’t have an account?{' '}
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
