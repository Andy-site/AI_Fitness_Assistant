import React, { useState } from 'react';
import { View,  Button, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import NextButton from '../components/NextButton';

const HeightScreen = ({ navigation, route }) => {
    const [height, setHeight] = useState(route.params?.height || '');

    const handleNext = () => {
        navigation.navigate('WeightScreen', { ...route.params, height });
    };

    return (
        <View style={styles.container}>
            <InputField
                placeholder="Height (e.g., 5.9)"
                style={styles.input}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
            />
            <NextButton title="Next" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default HeightScreen;
