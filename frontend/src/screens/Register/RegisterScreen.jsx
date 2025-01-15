import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import InputField from '../../components/InputField'; // Assuming this is a reusable input component
import NextButton from '../../components/NextButton';

const RegisterScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isFocused, setIsFocused] = useState(null);

    const handleVerifyOtp = () => {
        // Join the OTP array into a string
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
            return;
        }

        // Proceed to next screen after OTP verification (assuming a success response)
        Alert.alert('Congrats!! You have been registered');

        // Navigate to the next screen, passing user info (if needed)
        navigation.navigate('LoginScreen', { ...route.params });
    };

    const handleOtpChange = (text, index) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = text;
        setOtp(updatedOtp);

        // Move focus to next input if the user enters a digit
        if (text && index < otp.length - 1) {
            setIsFocused(index + 1);
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && index > 0) {
            // Move focus to the previous input if backspace is pressed
            setIsFocused(index - 1);
        }
    };

    const handleFocus = (index) => {
        setIsFocused(index);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Enter OTP</Text>
                <View style={styles.purpleBackground}>
                    <Text style={styles.label}>Enter the OTP sent to your email</Text>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <InputField
                                key={index}
                                style={styles.input}
                                maxLength={1}
                                keyboardType="numeric"
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                onFocus={() => handleFocus(index)}
                                autoFocus={isFocused === index} // Automatically focus the current input
                            />
                        ))}
                    </View>
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
        backgroundColor: '#000000', // Black background
        padding: 20,
    },
    purpleBackground: {
        backgroundColor: '#B3A0FF', // Purple container background
        width: '100%',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
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
});

export default RegisterScreen;
