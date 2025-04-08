import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput';
import NextButton from '../../components/NextButton';
import { ActivityIndicator, Modal } from 'react-native';
import { loginUser } from '../../api/fithubApi'; // Import API functions
import Toast from 'react-native-toast-message';

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }
  
    setLoading(true); // Show loading modal
  
    try {
      const response = await loginUser(email, password);
  
      if (!response || !response.access) {
        throw new Error('No access token received');
      }
      

// Inside your handleSubmit:
Toast.show({
  type: 'success',
  text1: 'Login Successful',
  text2: 'Welcome back 👋',
});
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
    } catch (err) {
      let message = 'Something went wrong during login.';
      const detail = err?.response?.data?.detail;
  
      if (detail === 'User not registered') {
        message = 'No account exists with this email. Please sign up.';
      } else if (detail === 'Incorrect password') {
        message = 'The password you entered is incorrect.';
      } else if (detail === 'Email and password are required') {
        message = 'Email and password fields cannot be empty.';
      }
  
      setError(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false); // Hide loading modal
    }


  };
  
  

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Log In</Text>
  
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
  
          {error && <Text style={styles.errorMessage}>{error}</Text>}
  
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword1')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
  
        <NextButton title="Log In" onPress={handleSubmit} />
  
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('Email')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
  
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#B3A0FF" />
            <Text style={styles.loadingText}>Logging in...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

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
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
});

export default LoginScreen;
