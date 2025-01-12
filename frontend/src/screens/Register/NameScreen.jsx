import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const NameScreen = ({ navigation, route }) => {
    // State for first and last name
    const [firstName, setFirstName] = useState(route.params?.firstName || '');
    const [lastName, setLastName] = useState(route.params?.lastName || '');

    const handleNext = () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Validation Error', 'Please enter both first and last names.');
            return;
        }

        // Pass the names to the next screen
        navigation.navigate('AgeScreen', { ...route.params, firstName, lastName });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter Your Name</Text>

            <View style={styles.purpleBackground}>
                <Text style={styles.label}>First Name</Text>
                <InputField
                    placeholder="First Name"
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <View style={styles.separator} />
                <Text style={styles.label}>Last Name</Text>
                <InputField
                    placeholder="Last Name"
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>

            <NextButton title="Next" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#000000', // Black background
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text for contrast
        marginBottom: 20,
        textAlign: 'center',
    },
    purpleBackground: {
        backgroundColor: '#B3A0FF', // Purple background for the input container
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#232323',
        marginBottom: 10,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
        position: 'relative',
      },
    input: {
        width: '100%',
        height: 50, // Consistent height
        backgroundColor: '#FFFFFF', // White background for inputs
        borderRadius: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#232323', // Input text color
        marginBottom: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#D1C4E9', // Light purple separator line
        marginVertical: 10,
    },
});

export default NameScreen;
