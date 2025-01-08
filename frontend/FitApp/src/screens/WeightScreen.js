import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const WeightScreen = ({ navigation, route }) => {
    const [weight, setWeight] = useState(route.params?.weight || '');

    const handleNext = () => {
        navigation.navigate('GoalScreen', { ...route.params, weight });
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Weight (e.g., 70.5)"
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
            />
            <Button title="Next" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default WeightScreen;
