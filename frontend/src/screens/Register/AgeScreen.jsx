import React, { useState } from 'react';
import { View,   StyleSheet } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const AgeScreen = ({ navigation, route }) => {
    const [age, setAge] = useState(route.params?.age || '');

    const handleNext = () => {
        const parsedAge = parseInt(age, 10); // Parse age as an integer
        if (!isNaN(parsedAge) && parsedAge > 0) {
            navigation.navigate('HeightScreen', { ...route.params, age: parsedAge });
        } else {
            alert("Please enter a valid age (e.g., 22)");
        }
    };

    return (
        <View style={styles.container}>
            <InputField
                placeholder="Age"
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
            />
            <NextButton title="Next" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default AgeScreen;
