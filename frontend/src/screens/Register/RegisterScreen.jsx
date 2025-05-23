import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import NextButton from '../../components/NextButton';
import { verifyOtp, reg } from '../../api/fithubApi';

const RegisterScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isFocused, setIsFocused] = useState(null);
    const [error, setError] = useState('');

    const inputRefs = useRef([]);

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        try {
            const response = await verifyOtp(route.params.email, enteredOtp);
            Alert.alert('Success', 'You have been registered successfully!');
            navigation.navigate('LoginScreen');
        } catch (error) {
            setError('Invalid OTP. Please try again.');
        }
        const response = await registerUser(userData);
                    console.log('Registration response:', response);
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

    const handleFocus = (index) => {
        setIsFocused(index);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Enter OTP</Text>
                <View style={styles.purpleBackground}>
                    <Text style={styles.label}>Enter the OTP sent to {route.params.email}</Text>
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
                                onFocus={() => handleFocus(index)}
                                autoFocus={isFocused === index}
                            />
                        ))}
                    </View>
                    {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
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
        backgroundColor: '#222',
    },
    purpleBackground: {
        backgroundColor: '#B3A0FF',
        width: '100%',
        padding: 20,
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
    errorMessage: {
        color: '#FF5252',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default RegisterScreen;
