import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import NextButton from '../components/NextButton';

const NameScreen = ({ navigation, route }) => {
    // State for first and last name
    const [firstName, setFirstName] = useState(route.params?.firstName || '');
    const [lastName, setLastName] = useState(route.params?.lastName || '');

    const handleNext = () => {
        // Passing both first and last name to the next screen
        navigation.navigate('AgeScreen', { ...route.params, firstName, lastName });
    };

    return (
        <View style={styles.container}>
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
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default NameScreen;
