import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import NextButton from '../../components/NextButton'; // Import custom button
import { sendOtp } from '../../api/fithubApi';



const EmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [session_id, setsession_id] = useState(null);

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

  const handleNext = async () => {
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
  
    try {
      const response = await sendOtp(email);
  
      // Log the response to see what's returned
      console.log("Response from sendOtp:", response);
  
      // Check the response for success and session_id
      if (response.success && response.session_id) {
        const session_id = response.session_id;
        console.log("Session ID:", session_id);
        navigation.navigate("RegisterScreen", {
          email,
          session_id,
        });
      } else {
        setErrorMessage(response.message || 'OTP sending failed');
        setIsValid(false);
      }
    } catch (error) {
      console.log("OTP Error", error);
      setErrorMessage("Failed to send OTP");
    }
  };
  
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.journeyText}>Let's start with your registration first</Text>

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

      <NextButton 
        title="Next" 
        onPress={handleNext} 
        disabled={!isValid || !email} // Disable if email is invalid or empty
        style={{ marginLeft: 0 }} // Apply inline marginLeft of -30
      />

      <Text style={styles.helperText}>We'll send you email verification</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  purpleBackground: {
    backgroundColor: '#B3A0FF',
    width: '100%',
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  journeyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '300',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#232323',
    fontWeight: '500',
    marginBottom: 10,
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
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default EmailScreen;