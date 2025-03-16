import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput';
import NextButton from '../../components/NextButton';

import { loginUser, fetchUserDetails } from '../../api/fithubApi'; // Import API functions

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      console.log('Attempting login with:', { email, password });

      // Call the login function
      const response = await loginUser(email, password);
      console.log('Login response:', response);

      if (!response || !response.access) {
        throw new Error('No access token received');
      }

      // Store JWT token in AsyncStorage
      await AsyncStorage.setItem('jwt_token', response.access);
      console.log('JWT token saved.');

      

      // Navigate to the Home screen after successful login
      navigation.navigate('Home');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      Alert.alert('Error', err.message || 'An error occurred during login.');
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

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  purpleBackground: {
    backgroundColor: '#B3A0FF',
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
    backgroundColor: '#D1C4E9',
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
    fontWeight: '450',
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
