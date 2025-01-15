import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import NextButton from '../../components/NextButton'; // Custom button component
import { sendOtp } from '../../api/fithubApi'; // API function

const ForgotPassword1 = ({ navigation }) => {
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
      await sendOtp(email);
      navigation.navigate('ForgotPassword2', { email });
    } catch (error) {
      // Check if the error is related to the email not being registered
      if (error.message === 'No CustomUser matches the given query') {
        Alert.alert("This email has not been registered yet");
      } else {
        Alert.alert('This email has not been registered yet');
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.journeyText}>
        Enter email you used in registration
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.purpleBackground}>
          <Text style={styles.label}>Email Address</Text>
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
        disabled={!isValid || !email}
        style={{ marginLeft: 0 }}
      />

      <Text style={styles.helperText}>We will send you an OTP for password reset</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        // paddingHorizontal: 20,
      },
      purpleBackground: {
        backgroundColor: '#B3A0FF',
        width: '100%',
        padding: 20,
        // borderRadius: 15,
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
        fontSize: 15,
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

export default ForgotPassword1;
