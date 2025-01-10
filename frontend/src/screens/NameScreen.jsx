import React, { useState } from 'react';
import { View,  StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import NextButton from '../components/NextButton';

const NameScreen = ({ navigation, route }) => {
    const [name, setName] = useState(route.params?.name || '');

    const handleNext = () => {
        navigation.navigate('AgeScreen', { ...route.params, name });
    };

    return (
        <View style={styles.container}>
            <InputField
                placeholder="Name"
                style={styles.input}
                value={name}
                onChangeText={setName}
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
