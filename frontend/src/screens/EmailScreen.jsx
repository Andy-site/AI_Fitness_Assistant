import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import NextButton from '../components/NextButton';

const EmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (email.length > 0) {
      const isValidEmail = validateEmail(email);
      setIsValid(isValidEmail);
      setErrorMessage(isValidEmail ? '' : 'Please enter a valid email address');
    } else {
      setErrorMessage('');
      setIsValid(true);
    }
  }, [email]);

  const handleNext = () => {
    if (!email) {
      setErrorMessage('Email is required');
      setIsValid(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setIsValid(false);
      return;
    }

    navigation.navigate('PasswordScreen', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Address</Text>
      <Text style={styles.subtitle}>Enter your email to create an account</Text>
      
      <View style={styles.inputContainer}>
        <InputField
          placeholder="e.g., user@example.com"
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            !isValid && email.length > 0 && styles.inputError
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errorMessage ?   (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <Text style={styles.helperText}>We'll send you email verification</Text>
         )}
      </View>

      <NextButton 
        title="Next" 
        onPress={handleNext}
        disabled={!isValid || !email}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  helperText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
});

export default EmailScreen;