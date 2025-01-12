import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

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
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.journeyText}>Let's start with your registration first</Text> {/* Added Journey Text */}

      <View style={styles.inputContainer}>
        <View style={styles.purpleBackground}>
          <Text style={styles.label}>Username or email</Text>
          <TextInput
            style={[styles.input, !isValid && email.length > 0 && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder="e.g., user@example.com"
            placeholderTextColor="#232323"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={!isValid || !email}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <Text style={styles.helperText}>We'll send you email verification</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black background
    padding: 0,
  },
  purpleBackground: {
    backgroundColor: '#B3A0FF',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  journeyText: { // Added new style for Journey text
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '300',
    marginBottom: 70, // Added margin for spacing
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: '',
  },
  label: {
    fontSize: 18,
    color: '#00000',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: '#232323',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    fontSize: 14,
    color: '#FF5252',
    marginTop: 8,
    marginLeft: 4,
  },
  nextButton: {
    width: '60%',
    height: 44,
    backgroundColor: '#232323', // Purple background for the button
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF', // white border
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default EmailScreen;
