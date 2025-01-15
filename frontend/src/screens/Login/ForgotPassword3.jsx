import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import NextButton from '../../components/NextButton';  // Import your NextButton component
import PasswordInput from '../../components/PasswordInput';  // Import your PasswordInput component
import { changePassword } from '../../api/fithubApi';  // Import the changePassword function from api.js


const ForgotPassword3 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email,OTP , otpTimestamp } = route.params;  // Get email and token from the previous screen
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = () => {
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must include at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setErrorMessage('Password must include at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(password)) {
      setErrorMessage('Password must include at least one numeric digit.');
      return false;
    }
    if (!/[@$!%*?&]/.test(password)) {
      setErrorMessage('Password must include at least one special character.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };


  const currentTime = Date.now();
  const timeDiff = (new Date(currentTime) - new Date(otpTimestamp)) / 1000;
  console.log('Time elapsed since OTP generation:', timeDiff, 'seconds');


  const handleResetPassword = async () => {
    console.log("Reset Password");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("OTP:", OTP);
    console.log("Time since OTP generation:", timeDiff, "seconds");

    if (timeDiff > 120) {
      Alert.alert('Error', 'OTP has expired. Please request a new OTP.');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    try {
      await changePassword(email, OTP, password); // Assuming changePassword handles the API request
      Alert.alert('Success', 'Password has been reset successfully.');
      navigation.navigate('LoginScreen'); // Navigate to the login screen
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>

      <View style={styles.purpleBackgroundLarge}>
        <Text style={styles.label}>New Password</Text>
        <PasswordInput
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
        />

        {/* Separator Line */}
        <View style={styles.separatorLine} />

        <Text style={styles.label}>Confirm Password</Text>
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <NextButton 
        title="Confirm" 
        onPress={handleResetPassword}
        disabled={password !== confirmPassword || password.length < 8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',  // Black background for the screen
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  purpleBackgroundLarge: {
    backgroundColor: '#B3A0FF',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,  // Rounded corners for the container
  },
  label: {
    fontSize: 16,
    color: '#232323',
    fontWeight: '500',
    marginBottom: 10,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#CCCCCC', // Light gray color for the separator line
    marginVertical: 15, // Space around the separator line
  },
  
  errorMessage: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default ForgotPassword3;
