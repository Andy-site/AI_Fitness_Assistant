import React, { useState } from 'react';
import { View,  Button, StyleSheet } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const WeightScreen = ({ navigation, route }) => {
    const [weight, setWeight] = useState(route.params?.weight || '');

    const handleNext = () => {
        const parsedWeight = parseFloat(weight); // Parse weight as a float
        if (!isNaN(parsedWeight) && parsedWeight > 0) {
            navigation.navigate('GoalScreen', { ...route.params, weight: parsedWeight });
        } else {
            alert("Please enter a valid weight (e.g., 65)");
        }
    };

    return (
        <View style={styles.container}>
            <InputField
                placeholder="Weight (e.g., 70.5)"
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
            />
            <NextButton title="Next" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default WeightScreen;
