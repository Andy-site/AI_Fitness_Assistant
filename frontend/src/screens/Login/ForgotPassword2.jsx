import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert } from 'react-native';
import { verifyPasswordResetOTP, requestPasswordResetOTP } from '../../api/fithubApi';
import NextButton from '../../components/NextButton';

const ForgotPassword2 = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true); // Start disabled
  const [timer, setTimer] = useState(120);
  const [otpTimestamp, setOtpTimestamp] = useState(null);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    // Set initial timestamp when component mounts
    setOtpTimestamp(new Date().toISOString());
  }, []);

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
        setErrorMessage('OTP must be 6 digits.');
        return;
    }
  
    try {
        // Assuming verifyPasswordResetOTP now uses a new endpoint
        await verifyPasswordResetOTP(email, enteredOtp); // Make sure this calls the correct backend endpoint
        navigation.navigate('ForgotPassword3', { 
            email: email,
            OTP: enteredOtp,
            otpTimestamp: otpTimestamp
        });
    } catch (error) {
        setErrorMessage(error.message || 'Invalid OTP.');
    }
  };
  
  

  const handleOtpChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    try {
        await requestPasswordResetOTP(email); // Ensure this calls the correct resend endpoint
        const newTimestamp = new Date().toISOString();
        setOtpTimestamp(newTimestamp);
        console.log('New OTP requested at:', newTimestamp);
  
        setResendDisabled(true);
        setTimer(120);
        setErrorMessage('');  // Clear any existing error messages
        setOtp(['', '', '', '', '', '']);  // Reset OTP inputs
    } catch (error) {
        Alert.alert("Error", error.message || 'Failed to resend OTP.');
    }
  };
  


  // Timer logic
  useEffect(() => {
    let intervalId;
    
    if (resendDisabled && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [resendDisabled, timer]);

  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter OTP</Text>
        <View style={styles.purpleBackground}>
          <Text style={styles.label}>Enter the OTP sent to your email</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => inputRefs.current[index] = el}
                style={styles.input}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus={index === 0}
              />
            ))}
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={handleResendOtp} 
            disabled={resendDisabled}
          >
            <Text style={[
              styles.resendButtonText,
              resendDisabled ? styles.resendButtonTextDisabled : null
            ]}>
              {resendDisabled 
                ? `Resend OTP: ${formatTimer(timer)}` 
                : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
        <NextButton title="Verify OTP" onPress={handleVerifyOtp} />
      </View>
    </TouchableWithoutFeedback>
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
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#232323',
    fontWeight: '500',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 50,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 18,
    color: '#232323',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 10,
    marginRight: 10,
  },
  errorText: {
    color: '#ff5252',
    marginTop: 10,
  },
  resendButton: {
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 15,
  },
  resendButtonText: {
    fontSize: 15,
    color: '#E2F163',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#232323', // Dark text for better visibility
    opacity: 0.8,
  },
});

export default ForgotPassword2;