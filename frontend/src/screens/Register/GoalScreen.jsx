import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import NextButton from '../../components/NextButton';
import { resendOTP, registerUser } from '../../api/fithubApi'; // Changed from sendOtp to resendOTP
import DropDownPicker from 'react-native-dropdown-picker';

const GoalScreen = ({ navigation, route }) => {
 
    const [goal, setGoal] = useState(route.params?.goal || '');
    const [goalWeight, setGoalWeight] = useState(route.params?.goalWeight || '');
    const [goalDuration, setGoalDuration] = useState(route.params?.goalDuration || '');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(
        Array.from({ length: 12 }, (_, i) => ({
            label: `${i + 1} Month${i > 0 ? 's' : ''}`,
            value: `${i + 1}`,
        }))
    );
    
    
    const goals = [
        { label: 'Weight Loss', value: 'Weight Loss' },
        { label: 'Weight Gain', value: 'Weight Gain' },
    ];

    const userWeight = route.params?.weight || 0;
    
    const handleSelect = (selectedGoal) => {
        setGoal(selectedGoal);
        setError('');
    };
    
    const handleNext = async () => {
        if (!route.params?.sessionId) {
            setError('Session expired. Please restart the registration process.');
            return;
        }
        if (!goal || !goalWeight || !goalDuration) {
            setError('Please fill in all fields');
            return;
        }
    
        if (goal === 'Weight Loss' && parseFloat(goalWeight) >= parseFloat(userWeight)) {
            setError(`Goal weight must be less than your current weight for weight loss. Your weight is ${userWeight}`);
            return;
        }
    
        if (goal === 'Weight Gain' && parseFloat(goalWeight) <= parseFloat(userWeight)) {
            setError(`Goal weight must be greater than your current weight for weight gain. Your weight is ${userWeight}`);
            return;
        }
    
        const userData = {
            ...route.params,
            goal,
            goal_weight: goalWeight,
            goal_duration: goalDuration,
            first_name: route.params.firstName,
            last_name: route.params.lastName,
            email: route.params.email,
        };
    
        try {
            
    
            if (!route.params?.sessionId) {
                // Call the registration API if sessionId is missing
                console.log('Session ID is missing. Registering user...');
                const registerResponse = await registerUser(email); // Replace with your registration API call
    
                if (registerResponse.success) {
                    console.log('Registration successful. OTP sent.');
                    navigation.navigate('RegisterScreen', {
                        email: userData.email,
                        userData: userData,
                        sessionId: registerResponse.sessionId, // Pass the new sessionId
                    });
                } else {
                    console.error('Registration failed:', registerResponse);
                    setError(registerResponse.message || 'Failed to register. Please try again.');
                }
                return;
            }
    
            console.log('About to call resendOTP API');
            const response = await resendOTP({
                email: userData.email,
                sessionId: route.params?.sessionId,
            });
    
            if (response.success) {
                console.log('OTP sent successfully');
                navigation.navigate('RegisterScreen', {
                    email: userData.email,
                    userData: userData,
                });
            } else {
                console.error('OTP sending failed with response:', response);
                setError(response.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Error during OTP sending:', error);
            setError('Error sending verification code. Please check console for details.');
        }
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
                            error && styles.errorBorder,
                        ]}
                        onPress={() => handleSelect(item.value)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                goal === item.value && styles.selectedText,
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

            <TextInput
                style={[styles.inputField, error && styles.errorBorder]}
                placeholder="Enter your goal weight"
                keyboardType="numeric"
                value={goalWeight}
                onChangeText={setGoalWeight}
            />

            <DropDownPicker
                open={open}
                value={goalDuration}
                items={items}
                setOpen={setOpen}
                setValue={setGoalDuration}
                setItems={setItems}
                placeholder="Select Goal Duration (e.g., 3 months)"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdownStyle}
                dropDownStyle={styles.dropdownList}
            />

            <NextButton
                title="Continue"
                onPress={handleNext}
                disabled={!goal || !goalWeight || !goalDuration}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        padding: 20,
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
    inputField: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    dropdownContainer: {
        marginBottom: 12,
        zIndex: 10,
    },
    dropdownStyle: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: 5,
    },
});

export default GoalScreen;