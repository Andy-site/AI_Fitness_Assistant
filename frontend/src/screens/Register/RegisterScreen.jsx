import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, TextInput, TouchableOpacity } from 'react-native';
import NextButton from '../../components/NextButton';
import { verifyOTP, registerUser, resendOTP } from '../../api/fithubApi'; // Updated imports

const RegisterScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isFocused, setIsFocused] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    
    // Get userData from route params
    const userData = route.params.userData || {};
    const email = route.params.email;

    const inputRefs = useRef([]);

    const handleVerifyOtp = async () => {
        const session_id = route.params.session_id;
        const enteredOtp = otp.join('');
        
        if (enteredOtp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }
    
        if (!session_id || !enteredOtp) {
            console.error('Session ID or OTP is missing');
            return;
        }
    
        setIsLoading(true);
        setError(''); // Clear any previous errors
        
        try {
            // Verify OTP along with session_id
            const verifyResponse = await verifyOTP(session_id, enteredOtp);
            
            if (!verifyResponse.success) {
                setError(verifyResponse.message || 'Invalid OTP. Please try again.');
                setIsLoading(false);
                return;
            }
    
            // Log OTP verification success
            console.log('OTP verification successful');
            
            // Navigate to the Password screen, passing session_id and email
            navigation.navigate('PasswordScreen', {
                session_id: session_id,
                email: verifyResponse.data.email, // Assuming the response contains the email
            });
    
        } catch (error) {
            // Detailed error logging for debugging
            console.error('Error during verification:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    
    
    

    const handleResendOtp = async () => {
        setIsResending(true);
        setError('');
        
        try {
            const response = await resendOTP(email);
            
            if (response.success) {
                Alert.alert('Success', 'OTP has been resent to your email.');
            } else {
                setError(response.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
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
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleFocus = (index) => {
        setIsFocused(index);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Verify Your Email</Text>
                <View style={styles.purpleBackground}>
                    <Text style={styles.label}>Enter the verification code sent to {email}</Text>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => inputRefs.current[index] = el}
                                style={[
                                    styles.input, 
                                    isFocused === index && styles.focusedInput
                                ]}
                                maxLength={1}
                                keyboardType="numeric"
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                onFocus={() => handleFocus(index)}
                                onBlur={() => setIsFocused(null)}
                            />
                        ))}
                    </View>
                    {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                    
                    <TouchableOpacity 
                        onPress={handleResendOtp} 
                        disabled={isResending}
                        style={styles.resendContainer}
                    >
                        <Text style={styles.resendText}>
                            {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
                        </Text>
                    </TouchableOpacity>
                </View>
                <NextButton 
                    title={isLoading ? "Verifying..." : "Complete Registration"} 
                    onPress={handleVerifyOtp} 
                    disabled={isLoading || otp.join('').length !== 6}
                />
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
        // padding: 20,
    },
    purpleBackground: {
        backgroundColor: '#B3A0FF',
        width: '100%',
        padding: 20,
        marginBottom: 20,
        borderRadius: 10,
    },
    label: {
        fontSize: 16,
        color: '#232323',
        fontWeight: '500',
        marginBottom: 10,
        textAlign: 'center',
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
        paddingHorizontal: 10,
    },
    input: {
        width: 45,
        height: 45,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        textAlign: 'center',
        fontSize: 18,
        color: '#232323',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    focusedInput: {
        borderColor: '#6600CC',
        borderWidth: 2,
    },
    errorMessage: {
        color: '#FF5252',
        marginTop: 10,
        textAlign: 'center',
        fontWeight: '500',
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    resendText: {
        color: '#232323',
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});

export default RegisterScreen;