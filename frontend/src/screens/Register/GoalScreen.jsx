import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NextButton from '../../components/NextButton';
import { registerUser, sendOtp } from '../../api/fithubApi';

const GoalScreen = ({ navigation, route }) => {
    const [goal, setGoal] = useState(route.params?.goal || '');
    const [error, setError] = useState('');

    const goals = [
        { label: 'Weight Loss', value: 'Weight Loss' },
        { label: 'Weight Gain', value: 'Weight Gain' },
    ];

    const handleNext = async () => {
        if (!goal) {
            setError('Please select your goal');
            return;
        }
    
        const userData = {
            ...route.params,
            goal,
            first_name: route.params.firstName,
            last_name: route.params.lastName,
        };
    
        try {
            console.log('Registering user with data:', userData);
    
            const response = await registerUser(userData);
            console.log('Registration response:', response);
    
            if (response?.email) { // Ensure email is available
                console.log('Sending OTP to email:', response.email);
                await sendOtp(response.email);
                console.log('OTP sent successfully');
    
                // Navigate to OTP verification screen
                navigation.navigate('RegisterScreen', { email: response.email });
            } else {
                throw new Error('Email not received from registration response');
            }
        } catch (error) {
            console.error('Error during registration or OTP sending:', error);
            setError('Error during registration or OTP sending.');
        }
    };
    
    

    const handleSelect = (selectedGoal) => {
        setGoal(selectedGoal);
        setError('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Goal</Text>
            <Text style={styles.subtitle}>What do you want to achieve?</Text>

            <View style={styles.selectorContainer}>
                {goals.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionButton,
                            goal === item.value && styles.selectedButton,
                            error && styles.errorBorder
                        ]}
                        onPress={() => handleSelect(item.value)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                goal === item.value && styles.selectedText
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}

                {error ? (
                    <Text style={styles.errorMessage}>{error}</Text>
                ) : (
                    <Text style={styles.helperText}>
                        This will help us personalize your experience
                    </Text>
                )}
            </View>

            <NextButton
                title="Finish Registration"
                onPress={handleNext}
                disabled={!goal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
        backgroundColor: '#000000',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#B3A0FF',
        textAlign: 'center',
        marginBottom: 24,
    },
    selectorContainer: {
        marginBottom: 24,
    },
    optionButton: {
        backgroundColor: '#B3A0FF',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    selectedButton: {
        backgroundColor: '#e8f0fe',
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    errorBorder: {
        borderColor: '#FF5252',
    },
    errorMessage: {
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

export default GoalScreen;
