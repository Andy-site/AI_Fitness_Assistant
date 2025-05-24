import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Dimensions, ToastAndroid } from 'react-native';
import NextButton from '../../components/NextButton';

const { width } = Dimensions.get('window');

const EmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(true);
  const progressAnim = new Animated.Value(0);

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
    console.log("Next button pressed");

    if (!email.trim()) {
  console.log("Email is empty");
  const message = "Email address is required";
  setErrorMessage(message);
  setIsValid(false);
  ToastAndroid.show(message, ToastAndroid.SHORT);
  return;
}


    if (!validateEmail(email)) {
      console.log("Invalid email format");
      setErrorMessage('Please enter a valid email address');
      setIsValid(false);
      return;
    }

    console.log("Valid email. Navigating to PasswordScreen...");

    Animated.timing(progressAnim, {
      toValue: 0.33,
      duration: 300,
      useNativeDriver: false,
    }).start();

    navigation.navigate('PasswordScreen', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.journeyText}>Let's start with your registration first</Text>

      <View style={styles.PurpleContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, !isValid && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder="e.g., user@example.com"
            placeholderTextColor="#232323"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>
      </View>

      <NextButton
  title="Next"
  onPress={handleNext}
/>


      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
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
  PurpleContainer: {
    backgroundColor: '#B3A0FF',
    width: '100%',
    padding: 20,
    marginBottom: 20,
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
    height: 45,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
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
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#ddd',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B80F7',
  },
});

export default EmailScreen;
