import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import InputField from '../components/InputField';
import NextButton from '../components/NextButton';

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
            <Text style={styles.label}>Enter Your Name:</Text>
            <InputField
                placeholder="First Name"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
            />
            <InputField
                placeholder="Last Name"
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
            />
            <NextButton title="Next" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    label: { fontSize: 18, marginBottom: 10 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default NameScreen;
